import { getToken, getRefreshToken, removeToken, removeRefreshToken } from '../../utils/storage';

export async function signUp(email, password, password2) {
    return await fetch('http://localhost:8000/auth/sign_up/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, password2 })
    })
    .then(res => res.json().then(data => ({ status: res.status, data: data })));
}

export async function signIn(email, password) {
    return await fetch('http://localhost:8000/auth/login/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
    })
    .then(res => res.json().then(data => ({ status: res.status, data: data })));
}

export async function signOut() {
    const accessToken = await getToken();
    const refreshToken = await getRefreshToken();

    return await fetch('http://localhost:8000/auth/logout/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ refresh: refreshToken }),
    })
    .then(res => {
        removeToken();
        removeRefreshToken();
        return res.json();
    })
    .catch(err => console.log(err));
}