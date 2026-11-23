// Set the environment to test
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret';
process.env.PORT = 5001; // Use a different port for testing

// Mock the database connection
const mockClient = {
  query: jest.fn().mockResolvedValue({ rows: [], rowCount: 1 }),
  release: jest.fn(),
};

jest.mock('../db', () => ({
  query: jest.fn().mockResolvedValue({ rows: [], rowCount: 1 }),
  connect: jest.fn().mockResolvedValue(mockClient),
  release: jest.fn(),
}));

// Mock console methods to keep test output clean
const originalConsole = { ...console };

global.beforeEach(() => {
  jest.clearAllMocks();
  // Mock console methods
  console.log = jest.fn();
  console.error = jest.fn();
});

global.afterEach(() => {
  // Restore original console methods
  Object.assign(console, originalConsole);
});
