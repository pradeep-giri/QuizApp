import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

import { AuthData } from './auth-data.model';
import { Subject } from 'rxjs';
import { environment } from 'src/environments/environment';

const BACKEND_URL = environment.apiUrl + '/users';


@Injectable({ providedIn: 'root' })
export class AuthService {
    private isAuthenticated = false;
    private token: string;
    private authStatusListener = new Subject<boolean>();

    constructor(private http: HttpClient, private router: Router) { }

    getToken() {
        return this.token;
    }

    getIsAuth() {
        return this.isAuthenticated;
    }

    getAuthStatusListener() {
        return this.authStatusListener.asObservable();
    }

    createUser(name: string, email: string, password: string) {
        const authData: AuthData = { name, email, password };
        this.http.post(BACKEND_URL + '/signup', authData)
            .subscribe(() => {
                this.router.navigate(['/login']);
            }, error => {
                this.authStatusListener.next(false);
            });
    }

    login(email: string, password: string) {
        const authData: AuthData = { name, email, password };
        this.http.post<{ token: string }>(BACKEND_URL + '/login', authData)
            .subscribe(response => {
                const token = response.token;
                this.token = token;
                if (token) {
                    this.isAuthenticated = true;
                    this.authStatusListener.next(true);
                    this.saveAuthData(token);
                    this.router.navigate(['/']);
                }
            }, error => {
                this.authStatusListener.next(false);
            });
    }

    autoAuthUser() {
        const authInformation = this.getAuthData();
        if (!authInformation) {
            return;
        }
        this.token = authInformation.token;
        this.isAuthenticated = true;
        this.authStatusListener.next(true);
    }

    logout(token: string) {
        this.http.post(BACKEND_URL + '/logout', token)
            .subscribe();
        this.token = null;
        this.isAuthenticated = false;
        this.authStatusListener.next(false);
        this.clearAuthData();
        this.router.navigate(['/login']);
    }

    private saveAuthData(token: string) {
        localStorage.setItem('token', token);
    }

    private clearAuthData() {
        localStorage.removeItem('token');
    }

    private getAuthData() {
        const token = localStorage.getItem('token');
        if (!token) {
            return;
        }
        return {
            token
        };
    }
}