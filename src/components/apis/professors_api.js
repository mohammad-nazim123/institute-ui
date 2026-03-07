import { getInstitute, getAdminKey, getProfessorKey } from '../../utils/storage';
import API_URL from  '../config'
export const addProfessor = async (payload) => {
    console.log("payload", payload);
    const [institute, adminKey] = await Promise.all([getInstitute(), getAdminKey()]);
    return await fetch(`${API_URL}/professors/professors/?institute=${institute}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            "X-Admin-Key": adminKey
        },
        body: JSON.stringify(payload),
    })
    .then(res => res.json().then(data => ({ status: res.status, data: data })))
    .catch(err => console.log(err));
};

export const getProfessors = async () => {
    const [institute, adminKey] = await Promise.all([getInstitute(), getAdminKey()]);
    return await fetch(`${API_URL}/professors/professors/?institute=${institute}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            "X-Admin-Key": adminKey
        },
    })
    .then(res => res.json().then(data => ({ status: res.status, data: data })))
    .catch(err => console.log(err));
};

export async function getProfessorId(email, uniqueId, institute) {
    const data = {
        email: email,
        personal_id: uniqueId,
        institute_name: institute
    };
    console.log("data", data);
    return await fetch(`${API_URL}/professors/verify/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    }).then(res => res.json().then(data => ({ status: res.status, body: data })));
}

export async function getProfessor(id) {
    const [institute, profKey] = await Promise.all([getInstitute(), getProfessorKey()]);
    return await fetch(`${API_URL}/professors/professors/${id}/?institute=${institute}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            "X-Personal-Key": profKey
        },
    }).then(res => res.json().then(data => ({ status: res.status, body: data })));
}

export async function getStudents() {
    const [institute, profKey] = await Promise.all([getInstitute(), getProfessorKey()]);
    return await fetch(`${API_URL}/admin_students/students/?institute=${institute}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            "X-Personal-Key": profKey
        },
    }).then(res => res.json().then(data => ({ status: res.status, body: data })));
}

export async function markAttendance(payload) {
    console.log("payload", payload);
    const [institute, profKey] = await Promise.all([getInstitute(), getProfessorKey()]);
    return await fetch(`${API_URL}/attendance/attendance/mark/?institute=${institute}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            "X-Personal-Key": profKey
        },
        body: JSON.stringify(payload),
    }).then(res => res.json().then(data => ({ status: res.status, body: data })));
}

export async function getAttendance(id) {
    const [institute, profKey] = await Promise.all([getInstitute(), getProfessorKey()]);
    return await fetch(`${API_URL}/attendance/attendance/student/${id}/?institute=${institute}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            "X-Personal-Key": profKey
        },
    }).then(res => res.json().then(data => ({ status: res.status, body: data })));
}

export async function getSchedule() {
    const [institute, profKey] = await Promise.all([getInstitute(), getProfessorKey()]);
    return await fetch(`${API_URL}/schedules/weekly-day/?institute=${institute}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            "X-Personal-Key": profKey
        },
    })
    .then(response => response.json().then(data => ({ status: response.status, body: data })));
}

export async function getExamSchedule() {
    const [institute, profKey] = await Promise.all([getInstitute(), getProfessorKey()]);
    return await fetch(`${API_URL}/schedules/exam-date/?institute=${institute}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            "X-Personal-Key": profKey
        },
    })
    .then(response => response.json().then(data => ({ status: response.status, body: data })));
}

export async function getPayments() {
    const [institute, profKey] = await Promise.all([getInstitute(), getProfessorKey()]);
    return await fetch(`${API_URL}/admin_payments/professors-payments/?institute=${institute}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'X-Personal-Key': profKey
        }
    })
    .then(res => res.json().then(data => ({ status: res.status, body: data })));
}
