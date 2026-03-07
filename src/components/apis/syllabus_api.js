import { getInstitute, getAdminKey } from '../../utils/storage';
import API_URL from '../config';
export async function getSyllabus() {
    const [institute, adminKey] = await Promise.all([getInstitute(), getAdminKey()]);
    return await fetch(`${API_URL}/syllabus/course/?institute=${institute}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            "X-Admin-Key": adminKey
        },
    })
    .then(response => response.json().then(data => ({
        status: response.status,
        body: data
    })))
}

export async function createSyllabus(name, subject, unit) {
    const [institute, adminKey] = await Promise.all([getInstitute(), getAdminKey()]);
    const data = {
        "institute": institute,
        "name": name,
        "subjects": [{
            "name": subject,
            "unit": unit
        }]
    };
    return await fetch(`${API_URL}/syllabus/course/?institute=${institute}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            "X-Admin-Key": adminKey
        },
        body: JSON.stringify(data),
    })
    .then(response => response.json().then(data => ({
        status: response.status,
        body: data
    })))
}

// subjectsToAssign: array of { subject: string, unit: string|number }
export async function assignSubject(studentId, subjectsToAssign) {
    const [institute, adminKey] = await Promise.all([getInstitute(), getAdminKey()]);
    return await fetch(
        `${API_URL}/admin_students/subjects/${studentId}/?institute=${institute}`,
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                "X-Admin-Key": adminKey
            },
            body: JSON.stringify({ subjects: subjectsToAssign }),
        }
    )
    .then(response => response.json().then(data => ({
        status: response.status,
        body: data
    })))
}

// Fetch current subject assignments for a student
export async function getStudentSubjects(studentId) {
    const [institute, adminKey] = await Promise.all([getInstitute(), getAdminKey()]);
    return await fetch(
        `${API_URL}/admin_students/subjects/${studentId}/?institute=${institute}`,
        {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                "X-Admin-Key": adminKey
            },
        }
    )
    .then(response => response.json().then(data => ({
        status: response.status,
        body: data
    })))
}
