import '../jest/jestSetup';
import { createMockEvent, mockUser } from '../jest/defaultArguments';
import { handler } from '../src/auditLog';
import { handler as formHandler } from '../src/form';

const createFormEvent = createMockEvent('createForm', { name: 'Demo Form' });

describe('Bookmark Lambda Tests', () => {
  it('getAuditLogs test', async () => {
    await formHandler(createFormEvent);
    const getAuditLogs = await handler(createMockEvent('getAuditLogs'));
    expect(getAuditLogs.count).toBe(1);
    expect(getAuditLogs.data.length).toBe(1);
    const auditLog = getAuditLogs.data[0];
    expect(auditLog.action).toBe('CREATE');
    expect(auditLog.documentId).toBeDefined();
    expect(auditLog.model).toBe('Form');
    expect(auditLog.createdBy._id.toString()).toBe(mockUser._id);
  });
});
