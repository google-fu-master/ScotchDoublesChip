# 🧪 Tests

Comprehensive testing infrastructure for all applications and components.

## 📁 **Testing Structure**

### **🔬 /unit/**

Unit tests for individual components and utilities:

- Component testing (React components)
- Utility function testing
- Database model testing
- API endpoint testing (isolated)

### **🔗 /integration/**

Integration tests for system interactions:

- Database integration tests
- API workflow testing
- Third-party service integration (Fargo, SMS)
- Authentication flow testing

### **🎭 /e2e/**

End-to-end tests for complete user journeys:

- Tournament Director workflows
- Player registration and participation
- Public tournament viewing
- Cross-platform compatibility

## 🎯 **Testing Strategy**

### **Testing Pyramid**

```text
     /\    E2E Tests (Few)
    /  \   - Complete user journeys
   /____\  - Cross-browser testing
  /      \ 
 /        \ Integration Tests (Some)
/          \ - API workflows
\          / - Database interactions
 \        /
  \______/   Unit Tests (Many)
           - Components, utilities
           - Fast feedback
```text

### **Test Coverage Goals**
- **Unit Tests**: 90%+ coverage
- **Integration Tests**: 80%+ critical paths
- **E2E Tests**: 100% critical user journeys

## 🛠️ **Testing Technology Stack**

### **Unit Testing**
- **Jest** - Test runner and assertion library
- **React Testing Library** - React component testing
- **MSW** - API mocking
- **@testing-library/user-event** - User interaction simulation

### **Integration Testing**
- **Jest** - Test runner
- **Supertest** - API testing
- **Test Database** - Isolated test database
- **Docker** - Service containerization for testing

### **E2E Testing**
- **Playwright** - Cross-browser testing
- **Visual Regression Testing** - UI consistency validation
- **Accessibility Testing** - WCAG compliance validation

## 📋 **Test Categories**

### **🏆 Tournament Director Tests**
```text
unit/tournament-director/
├── components/
│   ├── TournamentCreator.test.tsx
│   ├── PlayerManager.test.tsx
│   └── ChipDistribution.test.tsx
├── utils/
│   ├── tournamentCalculations.test.ts
│   └── bracketGeneration.test.ts
└── api/
    ├── tournaments.test.ts
    └── players.test.ts

integration/tournament-director/
├── tournament-creation-workflow.test.ts
├── player-management.test.ts
└── chip-distribution.test.ts

e2e/tournament-director/
├── create-tournament.spec.ts
├── manage-registrations.spec.ts
└── run-tournament.spec.ts
```text

### **👥 Player Tests**
```text
unit/player/
├── components/
│   ├── TournamentDiscovery.test.tsx
│   ├── TeamRegistration.test.tsx
│   └── PlayerProfile.test.tsx
├── utils/
│   ├── fargoIntegration.test.ts
│   └── chipCalculations.test.ts
└── api/
    ├── registration.test.ts
    └── authentication.test.ts

integration/player/
├── registration-workflow.test.ts
├── fargo-integration.test.ts
└── notification-system.test.ts

e2e/player/
├── register-for-tournament.spec.ts
├── team-formation.spec.ts
└── tournament-participation.spec.ts
```text

### **🌐 Public Interface Tests**
```text
unit/public/
├── components/
│   ├── TournamentBracket.test.tsx
│   ├── LiveResults.test.tsx
│   └── PlayerStats.test.tsx
└── utils/
    ├── bracketVisualization.test.ts
    └── realTimeUpdates.test.ts

e2e/public/
├── view-tournament-brackets.spec.ts
├── live-results-updates.spec.ts
└── tournament-information.spec.ts
```text

### **🔧 Shared Component Tests**
```text
unit/shared/
├── components/
│   ├── ChipCalculator.test.tsx
│   ├── PlayerSearch.test.tsx
│   └── NotificationSystem.test.tsx
├── utils/
│   ├── dateHelpers.test.ts
│   ├── validation.test.ts
│   └── formatting.test.ts
└── types/
    └── typeValidation.test.ts
```text

## 🚀 **Running Tests**

### **Development Testing**
```bash
# Run all tests
npm run test

# Run unit tests only
npm run test:unit

# Run integration tests
npm run test:integration

# Run E2E tests
npm run test:e2e

# Watch mode for active development
npm run test:watch

# Generate coverage report
npm run test:coverage
```text

### **Environment-Specific Testing**
```bash
# Test against development database
npm run test:integration:dev

# Test against staging environment
npm run test:e2e:staging

# Full test suite for CI/CD
npm run test:all
```text

## 🔧 **Test Configuration**

### **Jest Configuration** (`jest.config.js`)
```javascript
module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],
  testMatch: [
    '<rootDir>/tests/**/*.test.{ts,tsx}',
    '<rootDir>/apps/**/__tests__/**/*.{ts,tsx}'
  ],
  collectCoverageFrom: [
    'apps/**/*.{ts,tsx}',
    'shared/**/*.{ts,tsx}',
    '!**/*.d.ts',
    '!**/node_modules/**'
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  }
};
```text

### **Playwright Configuration** (`playwright.config.ts`)
```typescript
export default {
  testDir: './tests/e2e',
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
    { name: 'mobile-chrome', use: { ...devices['Pixel 5'] } },
    { name: 'mobile-safari', use: { ...devices['iPhone 12'] } }
  ],
  webServer: {
    command: 'npm run dev',
    port: 3000,
    timeout: 120000
  }
};
```text

## 📊 **Testing Data Management**

### **Test Database**
- **Isolated Environment** - Separate test database
- **Fresh State** - Reset between test suites
- **Seed Data** - Consistent test data sets
- **Transaction Rollback** - Clean state for each test

### **Mock Services**
- **Fargo API** - Mocked rating service responses
- **SMS Service** - Mocked Twilio interactions
- **Email Service** - Mocked SendGrid interactions
- **Payment Processing** - Mocked payment flows

### **Test Data Factories**
```typescript
// Tournament factory
const createTestTournament = (overrides = {}) => ({
  name: 'Test Tournament',
  maxTeams: 32,
  entryFee: 50,
  startDateTime: new Date('2024-01-15T19:00:00Z'),
  ...overrides
});

// Player factory
const createTestPlayer = (overrides = {}) => ({
  phone: '+1555123456',
  firstName: 'Test',
  lastName: 'Player',
  fargoRating: 650,
  ...overrides
});
```text

## 🎯 **Key Test Scenarios**

### **Critical User Journeys**
1. **Tournament Director Creates Tournament** - Complete tournament setup flow
2. **Players Register as Team** - Registration and chip calculation
3. **Tournament Execution** - Match creation and scoring
4. **Real-time Updates** - Live bracket and score updates
5. **Notification System** - Multi-channel notification delivery

### **Edge Cases**
- **Network Failures** - Offline functionality testing
- **Concurrent Users** - Multiple users performing same actions
- **Data Validation** - Invalid input handling
- **Rate Limiting** - API rate limit compliance
- **Security** - Authentication and authorization edge cases

### **Performance Testing**
- **Load Testing** - Multiple concurrent tournaments
- **Database Performance** - Complex queries under load
- **Real-time Updates** - WebSocket performance
- **Mobile Performance** - Touch interactions and responsiveness

## 🔍 **Quality Gates**

### **Pull Request Requirements**
- ✅ All tests pass
- ✅ Code coverage maintained/improved
- ✅ No linting errors
- ✅ Type checking passes
- ✅ E2E tests for new features

### **Deployment Prerequisites**
- ✅ Full test suite passes
- ✅ Integration tests against staging
- ✅ Security scans pass
- ✅ Performance benchmarks met

## 📈 **Test Metrics & Reporting**

- **Coverage Reports** - Detailed line and branch coverage
- **Performance Metrics** - Test execution time tracking
- **Flaky Test Detection** - Automated flaky test identification
- **Visual Regression** - Screenshot comparison reports
- **Accessibility Scores** - WCAG compliance validation

The testing infrastructure ensures high code quality, reliable deployments, and excellent user experience across all platforms and environments.
