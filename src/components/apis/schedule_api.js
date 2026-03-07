import { getInstitute, getAdminKey } from '../../utils/storage';
import { getStudentUniqueId, getProfessorKey } from '../../utils/storage';
import API_URL from '../config';
export async function createSchedule(schedule) {
    const [institute, adminKey] = await Promise.all([getInstitute(), getAdminKey()]);

    return await fetch(`${API_URL}/schedules/weekly-day/?institute=${institute}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            "X-Admin-Key": adminKey
        },
        body: JSON.stringify(schedule),
    })
    .then(response => response.json().then(data => ({ status: response.status, body: data })));
}

export async function getSchedule() {
    const [institute, adminKey, profKey, studentKey] = await Promise.all([
        getInstitute(), getAdminKey(), getProfessorKey(), getStudentUniqueId()
    ]);
    const headers = adminKey
        ? { 'Content-Type': 'application/json', "X-Admin-Key": adminKey }
        : profKey
        ? { 'Content-Type': 'application/json', "x-personal-key": profKey }
        : { 'Content-Type': 'application/json', "X-Personal-Key": studentKey };

    return await fetch(`${API_URL}/schedules/weekly-day/?institute=${institute}`, {
        method: 'GET',
        headers,
    })
    .then(response => response.json().then(data => ({ status: response.status, body: data })));
}

export async function createExamSchedule(exam) {
    const [institute, adminKey] = await Promise.all([getInstitute(), getAdminKey()]);
    return await fetch(`${API_URL}/schedules/exam-date/?institute=${institute}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-Admin-Key': adminKey
        },
        body: JSON.stringify(exam),
    })
    .then(response => response.json().then(data => ({ status: response.status, body: data })));
}

export async function getExamSchedule() {
    const [institute, adminKey, profKey, studentKey] = await Promise.all([
        getInstitute(), getAdminKey(), getProfessorKey(), getStudentUniqueId()
    ]);
    const headers = adminKey
        ? { 'Content-Type': 'application/json', "X-Admin-Key": adminKey }
        : profKey
        ? { 'Content-Type': 'application/json', "x-personal-key": profKey }
        : { 'Content-Type': 'application/json', "X-Personal-Key": studentKey };

    return await fetch(`${API_URL}/schedules/exam-date/?institute=${institute}`, {
        method: 'GET',
        headers,
    })
    .then(response => response.json().then(data => ({ status: response.status, body: data })));
}
