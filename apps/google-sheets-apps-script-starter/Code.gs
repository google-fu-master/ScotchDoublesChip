/**
 * Scotch Doubles Chip Tournament - Google Apps Script Starter
 * Bound to a Google Sheet. Tournament state is isolated per source tab (sheet).
 */

var TD = {
  MAX_TABLES: 11,
  MIN_TABLES: 1,
  DEFAULT_TABLES: 6,
  UNDO_LIMIT: 10,
  STATE_PREFIX: 'TD_STATE_',
  STATE_INDEX_KEY: 'TD_STATE_KEYS',
  ADMIN_USER_KEY: 'TD_ADMIN_USERNAME',
  ADMIN_PASS_KEY: 'TD_ADMIN_PASSWORD',
  SESSION_PREFIX: 'TD_SESSION_'
};

function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('Tournament Director')
    .addItem('Build Tournament From Active Tab', 'buildTournamentFromActiveSheet')
    .addItem('Reset Tournament For Active Tab', 'resetTournamentFromActiveSheet')
    .addSeparator()
    .addItem('Open Director Web View', 'openDirectorWebView')
    .addItem('Open Public Web View', 'openPublicWebView')
    .addToUi();
}

function doGet(e) {
  var view = (e && e.parameter && e.parameter.view) || 'public';
  var template = HtmlService.createTemplateFromFile(view === 'director' ? 'Director' : 'Public');
  return template
    .evaluate()
    .setTitle(view === 'director' ? 'Tournament Director' : 'Tournament Display')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

function buildTournamentFromActiveSheet() {
  var ui = SpreadsheetApp.getUi();
  var sheet = SpreadsheetApp.getActiveSheet();

  var response = ui.prompt(
    'Create Tournament',
    'Enter table count (' + TD.MIN_TABLES + '-' + TD.MAX_TABLES + '):',
    ui.ButtonSet.OK_CANCEL
  );

  if (response.getSelectedButton() !== ui.Button.OK) return;

  var tableCount = parseInt(response.getResponseText(), 10);
  if (!tableCount || tableCount < TD.MIN_TABLES || tableCount > TD.MAX_TABLES) {
    ui.alert('Invalid table count. Using default ' + TD.DEFAULT_TABLES + '.');
    tableCount = TD.DEFAULT_TABLES;
  }

  var state = buildTournamentFromSheet_(sheet, tableCount);
  ui.alert('Tournament created for tab "' + sheet.getName() + '" with ' + state.teams.length + ' teams.');
}

function resetTournamentFromActiveSheet() {
  var ui = SpreadsheetApp.getUi();
  var sheet = SpreadsheetApp.getActiveSheet();
  var stateKey = getStateKey_(sheet.getSheetId());

  var response = ui.alert(
    'Reset tournament?',
    'This clears tournament state for tab "' + sheet.getName() + '" only.',
    ui.ButtonSet.YES_NO
  );

  if (response !== ui.Button.YES) return;

  PropertiesService.getDocumentProperties().deleteProperty(stateKey);
  removeStateKeyFromIndex_(stateKey);
  ui.alert('Tournament reset complete for tab "' + sheet.getName() + '".');
}

function openDirectorWebView() {
  openWebView_('director');
}

function openPublicWebView() {
  openWebView_('public');
}

function openWebView_(view) {
  var ui = SpreadsheetApp.getUi();
  var url = ScriptApp.getService().getUrl();

  if (!url) {
    ui.alert('Deploy this script as a Web app first, then use this menu item.');
    return;
  }

  var fullUrl = url + '?view=' + encodeURIComponent(view);
  var html = HtmlService.createHtmlOutput(
    '<div style="font-family:Arial,sans-serif;padding:12px">' +
      '<p>Open this URL:</p>' +
      '<p><a href="' + fullUrl + '" target="_blank">' + fullUrl + '</a></p>' +
      '<p>You can also share this for the ' + (view === 'public' ? 'public display' : 'director view') + '.</p>' +
    '</div>'
  ).setWidth(520).setHeight(180);

  ui.showModalDialog(html, 'Web View URL');
}

function publicListTournaments() {
  var states = getAllStates_();
  states.sort(function(a, b) {
    return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
  });

  return states.map(function(s) {
    return {
      sheetId: s.source.sheetId,
      sheetName: s.source.sheetName,
      updatedAt: s.updatedAt,
      teamsRemaining: s.teams.filter(function(t) { return !t.eliminated; }).length,
      tablesOpen: s.tables.filter(function(t) { return t.status === 'open' || t.status === 'closing'; }).length
    };
  });
}

function publicGetState(sheetId) {
  var state = loadStateBySheetId_(sheetId);
  if (!state) return { error: 'Tournament not found.' };
  return toClientState_(state);
}

function directorLogin(username, password) {
  var props = PropertiesService.getScriptProperties();
  ensureDefaultCredentials_(props);

  var savedUser = props.getProperty(TD.ADMIN_USER_KEY);
  var savedPass = props.getProperty(TD.ADMIN_PASS_KEY);

  if (username !== savedUser || password !== savedPass) {
    return { ok: false, message: 'Invalid username or password.' };
  }

  var token = Utilities.getUuid();
  CacheService.getScriptCache().put(TD.SESSION_PREFIX + token, '1', 8 * 60 * 60);
  return { ok: true, token: token };
}

function directorListTournaments(token) {
  requireAuth_(token);
  return publicListTournaments();
}

function directorGetState(token, sheetId) {
  requireAuth_(token);
  return publicGetState(sheetId);
}

function directorBuildFromSheet(token, sheetName, tableCount) {
  requireAuth_(token);
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(sheetName);
  if (!sheet) throw new Error('Sheet not found: ' + sheetName);

  var count = parseInt(tableCount, 10);
  if (!count || count < TD.MIN_TABLES || count > TD.MAX_TABLES) {
    count = TD.DEFAULT_TABLES;
  }

  var state = buildTournamentFromSheet_(sheet, count);
  return toClientState_(state);
}

function directorSetTableCount(token, sheetId, tableCount) {
  requireAuth_(token);
  var state = requireState_(sheetId);

  var count = parseInt(tableCount, 10);
  if (!count || count < TD.MIN_TABLES || count > TD.MAX_TABLES) {
    throw new Error('Table count must be between ' + TD.MIN_TABLES + ' and ' + TD.MAX_TABLES + '.');
  }

  pushUndo_(state, 'Set table count to ' + count);

  state.settings.tableCount = count;
  resizeTables_(state);
  fillOpenTables_(state);
  saveState_(state);

  return toClientState_(state);
}

function directorReportLoser(token, sheetId, tableId, loserTeamId) {
  requireAuth_(token);
  var state = requireState_(sheetId);
  pushUndo_(state, 'Report loser at table ' + tableId);

  var table = findTable_(state, tableId);
  if (!table) throw new Error('Table not found.');
  if (!table.teamAId || !table.teamBId) throw new Error('Table is not in a live match.');

  if (table.teamAId !== loserTeamId && table.teamBId !== loserTeamId) {
    throw new Error('Loser is not seated at this table.');
  }

  var winnerId = table.teamAId === loserTeamId ? table.teamBId : table.teamAId;
  var loser = requireTeam_(state, loserTeamId);
  var winner = requireTeam_(state, winnerId);

  loser.losses += 1;
  loser.chips = Math.max(0, loser.chips - 1);
  if (loser.chips <= 0) loser.eliminated = true;

  winner.wins += 1;

  incrementMatchup_(state, winnerId, loserTeamId);

  table.lastCompletedAt = new Date().toISOString();

  if (table.status === 'closing') {
    table.teamAId = null;
    table.teamBId = null;
    table.status = 'closed';
    enqueueIfEligible_(state, winnerId, true);
  } else {
    table.teamAId = winnerId;
    table.teamBId = null;
    enqueueIfEligible_(state, loserTeamId, false);
  }

  reconcileState_(state);
  fillOpenTables_(state);
  saveState_(state);

  return toClientState_(state);
}

function directorShuffleQueue(token, sheetId) {
  requireAuth_(token);
  var state = requireState_(sheetId);
  pushUndo_(state, 'Shuffle queue');

  shuffleArray_(state.queue);
  saveState_(state);
  return toClientState_(state);
}

function directorSetTableClosing(token, sheetId, tableId, isClosing) {
  requireAuth_(token);
  var state = requireState_(sheetId);
  pushUndo_(state, (isClosing ? 'Close' : 'Reopen') + ' table ' + tableId);

  var table = findTable_(state, tableId);
  if (!table) throw new Error('Table not found.');

  if (isClosing) {
    if (table.teamAId || table.teamBId) {
      table.status = 'closing';
    } else {
      table.status = 'closed';
    }
  } else {
    table.status = 'open';
  }

  fillOpenTables_(state);
  saveState_(state);
  return toClientState_(state);
}

function directorUndo(token, sheetId) {
  requireAuth_(token);
  var state = requireState_(sheetId);
  if (!state.undo || !state.undo.length) {
    return { error: 'Nothing to undo.', state: toClientState_(state) };
  }

  var entry = state.undo.pop();
  var restored = entry.snapshot;
  restored.undo = state.undo;
  restored.updatedAt = new Date().toISOString();
  saveState_(restored);

  return { message: 'Undid: ' + entry.label, state: toClientState_(restored) };
}

function directorUpdateTeam(token, sheetId, teamId, updates) {
  requireAuth_(token);
  var state = requireState_(sheetId);
  pushUndo_(state, 'Update team ' + teamId);

  var team = requireTeam_(state, teamId);

  if (updates.player1 !== undefined) team.player1 = String(updates.player1 || '').trim();
  if (updates.player2 !== undefined) team.player2 = String(updates.player2 || '').trim();
  if (updates.chips !== undefined) team.chips = Math.max(0, parseInt(updates.chips, 10) || 0);
  if (updates.wins !== undefined) team.wins = Math.max(0, parseInt(updates.wins, 10) || 0);
  if (updates.losses !== undefined) team.losses = Math.max(0, parseInt(updates.losses, 10) || 0);

  team.name = buildTeamName_(team.player1, team.player2);
  team.eliminated = team.chips <= 0;

  reconcileState_(state);
  fillOpenTables_(state);
  saveState_(state);

  return toClientState_(state);
}

function directorAssignNow(token, sheetId) {
  requireAuth_(token);
  var state = requireState_(sheetId);
  pushUndo_(state, 'Manual assignment pass');

  fillOpenTables_(state);
  saveState_(state);
  return toClientState_(state);
}

function buildTournamentFromSheet_(sheet, tableCount) {
  var teams = parseTeamsFromSheet_(sheet);
  if (teams.length < 2) {
    throw new Error('Need at least 2 teams on the source tab to build tournament.');
  }

  var state = {
    version: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    source: {
      spreadsheetId: sheet.getParent().getId(),
      sheetId: String(sheet.getSheetId()),
      sheetName: sheet.getName()
    },
    settings: {
      tableCount: tableCount,
      maxTables: TD.MAX_TABLES
    },
    teams: teams,
    queue: teams.filter(function(t) { return t.chips > 0; }).map(function(t) { return t.id; }),
    tables: createTables_(tableCount),
    matchupCounts: {},
    undo: []
  };

  fillOpenTables_(state);
  saveState_(state);
  return state;
}

function parseTeamsFromSheet_(sheet) {
  var lastRow = sheet.getLastRow();
  if (lastRow < 2) return [];

  var values = sheet.getRange(2, 1, lastRow - 1, 6).getValues();
  var colAFormulas = sheet.getRange(2, 1, lastRow - 1, 1).getFormulas();
  var teams = [];

  for (var i = 0; i < values.length; i++) {
    var row = values[i];
    var colAValue = String(row[0] || '').trim();
    var colAFormula = String(colAFormulas[i][0] || '').trim();

    // Stop at the first blank in column A or the first formula cell in column A.
    if (!colAValue || (colAFormula && colAFormula.charAt(0) === '=')) {
      break;
    }

    var player1 = String(row[0] || '').trim();
    var player2 = String(row[2] || '').trim();

    if (!player1 && !player2) continue;

    var chips = parseInt(row[5], 10);
    if (!chips || chips < 0) chips = 0;

    teams.push({
      id: 'T' + sheet.getSheetId() + '_' + (i + 2),
      sourceRow: i + 2,
      player1: player1,
      player2: player2,
      name: buildTeamName_(player1, player2),
      chips: chips,
      wins: 0,
      losses: 0,
      eliminated: chips <= 0
    });
  }

  return teams;
}

function createTables_(tableCount) {
  var count = Math.max(TD.MIN_TABLES, Math.min(TD.MAX_TABLES, tableCount));
  var tables = [];

  for (var i = 1; i <= count; i++) {
    tables.push({
      id: 'TABLE_' + i,
      number: i,
      label: 'Table ' + i,
      status: 'open',
      teamAId: null,
      teamBId: null,
      lastAssignmentAt: null,
      lastCompletedAt: null
    });
  }

  return tables;
}

function resizeTables_(state) {
  var desired = state.settings.tableCount;
  var current = state.tables.length;

  if (desired === current) return;

  if (desired > current) {
    for (var i = current + 1; i <= desired; i++) {
      state.tables.push({
        id: 'TABLE_' + i,
        number: i,
        label: 'Table ' + i,
        status: 'open',
        teamAId: null,
        teamBId: null,
        lastAssignmentAt: null,
        lastCompletedAt: null
      });
    }
    return;
  }

  for (var t = desired; t < current; t++) {
    var table = state.tables[t];
    if (table.teamAId) enqueueIfEligible_(state, table.teamAId, false);
    if (table.teamBId) enqueueIfEligible_(state, table.teamBId, false);
  }

  state.tables = state.tables.slice(0, desired);
  reconcileState_(state);
}

function fillOpenTables_(state) {
  reconcileState_(state);

  var now = new Date().toISOString();

  for (var i = 0; i < state.tables.length; i++) {
    var table = state.tables[i];
    if (table.status !== 'open') continue;

    if (!table.teamAId && !table.teamBId) {
      var first = dequeueNextEligible_(state);
      var second = dequeueNextEligible_(state);

      if (!first || !second) {
        if (first) enqueueIfEligible_(state, first, true);
        continue;
      }

      table.teamAId = first;
      table.teamBId = second;
      table.lastAssignmentAt = now;
      continue;
    }

    if (table.teamAId && !table.teamBId) {
      var challenger = pickBestOpponentForTable_(state, table.teamAId);
      if (challenger) {
        table.teamBId = challenger;
        table.lastAssignmentAt = now;
      }
      continue;
    }

    if (!table.teamAId && table.teamBId) {
      table.teamAId = table.teamBId;
      table.teamBId = null;
    }
  }
}

function pickBestOpponentForTable_(state, waitingTeamId) {
  if (!state.queue.length) return null;

  var bestIndex = -1;
  var bestScore = Number.MAX_SAFE_INTEGER;

  for (var i = 0; i < state.queue.length; i++) {
    var candidateId = state.queue[i];
    var candidate = findTeam_(state, candidateId);
    if (!candidate || candidate.eliminated || candidate.chips <= 0) continue;

    var score = getMatchupCount_(state, waitingTeamId, candidateId);
    if (score < bestScore) {
      bestScore = score;
      bestIndex = i;
      if (bestScore === 0) break;
    }
  }

  if (bestIndex < 0) return null;
  var chosen = state.queue[bestIndex];
  state.queue.splice(bestIndex, 1);
  return chosen;
}

function dequeueNextEligible_(state) {
  while (state.queue.length) {
    var teamId = state.queue.shift();
    var team = findTeam_(state, teamId);
    if (team && !team.eliminated && team.chips > 0) return teamId;
  }
  return null;
}

function enqueueIfEligible_(state, teamId, front) {
  var team = findTeam_(state, teamId);
  if (!team || team.eliminated || team.chips <= 0) return;
  if (state.queue.indexOf(teamId) >= 0) return;

  if (front) state.queue.unshift(teamId);
  else state.queue.push(teamId);
}

function reconcileState_(state) {
  var seated = {};

  for (var i = 0; i < state.tables.length; i++) {
    var table = state.tables[i];

    if (table.teamAId) {
      var ta = findTeam_(state, table.teamAId);
      if (!ta || ta.chips <= 0 || ta.eliminated) table.teamAId = null;
      else seated[table.teamAId] = true;
    }

    if (table.teamBId) {
      var tb = findTeam_(state, table.teamBId);
      if (!tb || tb.chips <= 0 || tb.eliminated) table.teamBId = null;
      else seated[table.teamBId] = true;
    }

    if (!table.teamAId && table.teamBId) {
      table.teamAId = table.teamBId;
      table.teamBId = null;
    }

    if (table.status === 'closed' && (table.teamAId || table.teamBId)) {
      table.status = 'closing';
    }

    if (table.status === 'closing' && !table.teamAId && !table.teamBId) {
      table.status = 'closed';
    }
  }

  var dedup = {};
  var cleanedQueue = [];
  for (var q = 0; q < state.queue.length; q++) {
    var id = state.queue[q];
    var team = findTeam_(state, id);
    if (!team || team.eliminated || team.chips <= 0) continue;
    if (seated[id]) continue;
    if (dedup[id]) continue;
    dedup[id] = true;
    cleanedQueue.push(id);
  }
  state.queue = cleanedQueue;

  for (var t = 0; t < state.teams.length; t++) {
    if (state.teams[t].chips <= 0) state.teams[t].eliminated = true;
  }
}

function incrementMatchup_(state, teamAId, teamBId) {
  var key = matchupKey_(teamAId, teamBId);
  state.matchupCounts[key] = (state.matchupCounts[key] || 0) + 1;
}

function getMatchupCount_(state, teamAId, teamBId) {
  var key = matchupKey_(teamAId, teamBId);
  return state.matchupCounts[key] || 0;
}

function matchupKey_(a, b) {
  return a < b ? a + '|' + b : b + '|' + a;
}

function findTable_(state, tableId) {
  for (var i = 0; i < state.tables.length; i++) {
    if (state.tables[i].id === tableId) return state.tables[i];
  }
  return null;
}

function findTeam_(state, teamId) {
  for (var i = 0; i < state.teams.length; i++) {
    if (state.teams[i].id === teamId) return state.teams[i];
  }
  return null;
}

function requireTeam_(state, teamId) {
  var team = findTeam_(state, teamId);
  if (!team) throw new Error('Team not found: ' + teamId);
  return team;
}

function requireState_(sheetId) {
  var state = loadStateBySheetId_(sheetId);
  if (!state) throw new Error('No tournament found for sheet id ' + sheetId + '.');
  return state;
}

function loadStateBySheetId_(sheetId) {
  if (!sheetId && sheetId !== 0) return null;
  var key = getStateKey_(sheetId);
  return loadStateByKey_(key);
}

function loadStateByKey_(key) {
  var raw = PropertiesService.getDocumentProperties().getProperty(key);
  if (!raw) return null;
  return JSON.parse(raw);
}

function saveState_(state) {
  state.updatedAt = new Date().toISOString();
  var key = getStateKey_(state.source.sheetId);
  PropertiesService.getDocumentProperties().setProperty(key, JSON.stringify(state));
  addStateKeyToIndex_(key);
  syncLiveSheet_(state);
}

function syncLiveSheet_(state) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var liveName = getLiveSheetName_(state.source.sheetName);
  var sheet = ss.getSheetByName(liveName);

  if (!sheet) {
    sheet = ss.insertSheet(liveName);
  }

  sheet.clear();

  var header = [
    ['Tournament Source Tab', state.source.sheetName],
    ['Last Updated', state.updatedAt],
    ['Table Count', state.settings.tableCount],
    ['Queue Length', state.queue.length]
  ];

  sheet.getRange(1, 1, header.length, 2).setValues(header);

  var tableRows = [['Table', 'Status', 'Team A', 'Team B', 'Last Assignment', 'Last Result']];
  for (var i = 0; i < state.tables.length; i++) {
    var table = state.tables[i];
    var teamA = table.teamAId ? formatTeamInline_(requireTeam_(state, table.teamAId)) : '';
    var teamB = table.teamBId ? formatTeamInline_(requireTeam_(state, table.teamBId)) : '';
    tableRows.push([
      table.label,
      table.status,
      teamA,
      teamB,
      table.lastAssignmentAt || '',
      table.lastCompletedAt || ''
    ]);
  }

  var tableStart = 6;
  sheet.getRange(tableStart, 1, tableRows.length, tableRows[0].length).setValues(tableRows);

  var queueRows = [['Queue Position', 'Team']];
  for (var q = 0; q < state.queue.length; q++) {
    queueRows.push([q + 1, formatTeamInline_(requireTeam_(state, state.queue[q]))]);
  }
  if (queueRows.length === 1) {
    queueRows.push(['', 'No teams waiting']);
  }

  var queueStart = tableStart + tableRows.length + 2;
  sheet.getRange(queueStart, 1, queueRows.length, queueRows[0].length).setValues(queueRows);

  var teamRows = [['Team', 'Chips', 'Wins', 'Losses', 'Eliminated']];
  for (var t = 0; t < state.teams.length; t++) {
    var team = state.teams[t];
    teamRows.push([team.name, team.chips, team.wins, team.losses, team.eliminated ? 'Yes' : 'No']);
  }

  var teamStart = queueStart + queueRows.length + 2;
  sheet.getRange(teamStart, 1, teamRows.length, teamRows[0].length).setValues(teamRows);

  sheet.setFrozenRows(1);
  sheet.autoResizeColumns(1, 6);
}

function getLiveSheetName_(sourceName) {
  var maxName = 95;
  var base = 'LIVE_' + sourceName;
  if (base.length <= maxName) return base;
  return base.substring(0, maxName);
}

function formatTeamInline_(team) {
  return team.name + ' (' + team.chips + ') ' + team.wins + '/' + team.losses;
}

function getStateKey_(sheetId) {
  return TD.STATE_PREFIX + String(sheetId);
}

function getAllStates_() {
  var props = PropertiesService.getDocumentProperties();
  var keys = getStateKeys_();
  var states = [];

  for (var i = 0; i < keys.length; i++) {
    var raw = props.getProperty(keys[i]);
    if (!raw) continue;
    try {
      states.push(JSON.parse(raw));
    } catch (err) {
      // Ignore malformed state entries
    }
  }

  return states;
}

function getStateKeys_() {
  var props = PropertiesService.getDocumentProperties();
  var raw = props.getProperty(TD.STATE_INDEX_KEY);
  if (!raw) return [];

  try {
    var keys = JSON.parse(raw);
    return Array.isArray(keys) ? keys : [];
  } catch (err) {
    return [];
  }
}

function addStateKeyToIndex_(key) {
  var props = PropertiesService.getDocumentProperties();
  var keys = getStateKeys_();

  if (keys.indexOf(key) < 0) {
    keys.push(key);
    props.setProperty(TD.STATE_INDEX_KEY, JSON.stringify(keys));
  }
}

function removeStateKeyFromIndex_(key) {
  var props = PropertiesService.getDocumentProperties();
  var keys = getStateKeys_();
  var filtered = keys.filter(function(k) { return k !== key; });
  props.setProperty(TD.STATE_INDEX_KEY, JSON.stringify(filtered));
}

function pushUndo_(state, label) {
  if (!state.undo) state.undo = [];
  var snapshot = JSON.parse(JSON.stringify(state));
  snapshot.undo = [];

  state.undo.push({
    label: label,
    at: new Date().toISOString(),
    snapshot: snapshot
  });

  if (state.undo.length > TD.UNDO_LIMIT) {
    state.undo = state.undo.slice(state.undo.length - TD.UNDO_LIMIT);
  }
}

function toClientState_(state) {
  var teamsById = {};
  for (var i = 0; i < state.teams.length; i++) {
    teamsById[state.teams[i].id] = state.teams[i];
  }

  var tables = state.tables.map(function(t) {
    return {
      id: t.id,
      number: t.number,
      label: t.label,
      status: t.status,
      lastAssignmentAt: t.lastAssignmentAt,
      lastCompletedAt: t.lastCompletedAt,
      teamA: t.teamAId ? teamsById[t.teamAId] : null,
      teamB: t.teamBId ? teamsById[t.teamBId] : null
    };
  });

  var queue = state.queue
    .map(function(id) { return teamsById[id]; })
    .filter(function(t) { return !!t; });

  return {
    version: state.version,
    createdAt: state.createdAt,
    updatedAt: state.updatedAt,
    source: state.source,
    settings: state.settings,
    tables: tables,
    queue: queue,
    teams: state.teams,
    undoDepth: (state.undo || []).length
  };
}

function requireAuth_(token) {
  if (!token) throw new Error('Authentication required.');

  var hit = CacheService.getScriptCache().get(TD.SESSION_PREFIX + token);
  if (!hit) throw new Error('Session expired. Log in again.');
}

function ensureDefaultCredentials_(props) {
  if (!props.getProperty(TD.ADMIN_USER_KEY)) {
    props.setProperty(TD.ADMIN_USER_KEY, 'admin');
  }
  if (!props.getProperty(TD.ADMIN_PASS_KEY)) {
    props.setProperty(TD.ADMIN_PASS_KEY, 'changeme');
  }
}

function buildTeamName_(player1, player2) {
  var p1 = formatPlayerShortName_(player1 || 'Player 1');
  var p2 = formatPlayerShortName_(player2 || 'Player 2');
  return p1 + ' + ' + p2;
}

function formatPlayerShortName_(fullName) {
  var clean = String(fullName || '').trim();
  if (!clean) return 'Player';

  var parts = clean.split(/\s+/).filter(function(p) { return !!p; });
  if (!parts.length) return 'Player';

  var firstName = parts[0];
  if (parts.length === 1) return firstName;

  var lastChunk = parts[parts.length - 1];

  // Hyphenated last name: use both initials (for example, Montellano-Cirivilleri -> MC).
  if (lastChunk.indexOf('-') >= 0) {
    var pieces = lastChunk
      .split('-')
      .map(function(p) { return String(p || '').trim(); })
      .filter(function(p) { return !!p; });

    var initials = '';
    for (var i = 0; i < pieces.length; i++) {
      var letter = firstLetter_(pieces[i]);
      if (letter) initials += letter;
    }

    if (initials) return firstName + ' ' + initials;
  }

  // For names with middle parts, use first name + last initial (for example, Kimberly Allen Moyak -> Kimberly M).
  var lastInitial = firstLetter_(lastChunk);
  return lastInitial ? (firstName + ' ' + lastInitial) : firstName;
}

function firstLetter_(text) {
  var s = String(text || '').trim();
  for (var i = 0; i < s.length; i++) {
    var ch = s.charAt(i);
    if (/[A-Za-z]/.test(ch)) return ch.toUpperCase();
  }
  return '';
}

function shuffleArray_(arr) {
  for (var i = arr.length - 1; i > 0; i--) {
    var j = Math.floor(Math.random() * (i + 1));
    var tmp = arr[i];
    arr[i] = arr[j];
    arr[j] = tmp;
  }
}
