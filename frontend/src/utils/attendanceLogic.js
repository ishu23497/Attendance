export const USERS_KEY = 'futuredesk_users';
export const ATTENDANCE_KEY = 'futuredesk_attendance';
export const CURRENT_USER_KEY = 'futuredesk_current_user';

// Mock users
export const mockUsers = [
    { id: 1, name: 'Admin User', email: 'admin@futuredesk.com', role: 'admin', password: '123' },
    { id: 2, name: 'John Doe', email: 'john@futuredesk.com', role: 'employee', password: '123' },
    { id: 3, name: 'Jane Smith', email: 'jane@futuredesk.com', role: 'employee', password: '123' },
];

export const login = (email, password) => {
    const user = mockUsers.find(u => u.email === email && u.password === password);
    if (user) {
        localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
        return user;
    }
    return null;
};

export const logout = () => {
    localStorage.removeItem(CURRENT_USER_KEY);
};

export const getCurrentUser = () => {
    const userStr = localStorage.getItem(CURRENT_USER_KEY);
    return userStr ? JSON.parse(userStr) : null;
};

export const getAttendance = () => {
    return JSON.parse(localStorage.getItem(ATTENDANCE_KEY)) || [];
};

export const checkIn = (userId) => {
    const records = getAttendance();
    const today = new Date().toISOString().split('T')[0];
    const existing = records.find(r => r.userId === userId && r.date === today);

    if (existing) return { success: false, message: 'Already checked in today.' };

    const now = new Date();
    const cutoff = new Date();
    cutoff.setHours(10, 0, 0, 0); // 10:00 AM

    const status = now > cutoff ? 'Late' : 'Present';

    const record = {
        id: Date.now(),
        userId,
        userName: mockUsers.find(u => u.id === userId)?.name || 'Unknown',
        date: today,
        checkInTime: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        checkOutTime: null,
        status
    };

    records.push(record);
    localStorage.setItem(ATTENDANCE_KEY, JSON.stringify(records));
    return { success: true, record };
};

export const checkOut = (userId) => {
    const records = getAttendance();
    const today = new Date().toISOString().split('T')[0];
    const recordIndex = records.findIndex(r => r.userId === userId && r.date === today);

    if (recordIndex === -1) return { success: false, message: 'No check-in record found for today.' };

    if (records[recordIndex].checkOutTime) return { success: false, message: 'Already checked out.' };

    const now = new Date();
    records[recordIndex].checkOutTime = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    localStorage.setItem(ATTENDANCE_KEY, JSON.stringify(records));
    return { success: true, record: records[recordIndex] };
};

export const getTodayStatus = (userId) => {
    const records = getAttendance();
    const today = new Date().toISOString().split('T')[0];
    return records.find(r => r.userId === userId && r.date === today);
};
