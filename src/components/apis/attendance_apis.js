import { getInstitute, getAdminKey } from '../../utils/storage';

export async function getSyllabus() {
    const [institute, adminKey] = await Promise.all([getInstitute(), getAdminKey()]);
    return await fetch(`http://localhost:8000/syllabus/course/?institute=${institute}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            "X-admin-key": adminKey
        },
    })
    .then(response => response.json().then(data => ({
        status: response.status,
        body: data
    })))
}

export async function getStudents(uniqueId) {
    const [institute, adminKey] = await Promise.all([getInstitute(), getAdminKey()]);
    return await fetch(`http://localhost:8000/admin_students/students/?institute=${institute}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            "X-Admin-Key": adminKey ? adminKey : uniqueId
        },
    }).then(res => res.json().then(data => ({ status: res.status, body: data })));
}

export async function getAttendance(id) {
    const [institute, adminKey] = await Promise.all([getInstitute(), getAdminKey()]);
    return await fetch(`http://localhost:8000/attendance/attendance/student/${id}/?institute=${institute}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            "X-Admin-Key": adminKey
        },
    }).then(res => res.json().then(data => ({ status: res.status, body: data })));
}

// Fetch attendance for a specific student for a specific month
// month format: "YYYY-MM"
export async function getStudentAttendanceByMonth(studentId, month) {
    const [institute, adminKey] = await Promise.all([getInstitute(), getAdminKey()]);
    return await fetch(
        `http://localhost:8000/attendance/attendance/student/${studentId}/?institute=${institute}&month=${month}`,
        {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                "X-Admin-Key": adminKey
            },
        }
    ).then(res => res.json().then(data => ({ status: res.status, body: data })));
}