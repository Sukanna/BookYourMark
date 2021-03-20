import { Injectable, OnInit } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import { User } from './user.model';
import { Subject } from 'rxjs';
import { async } from 'rxjs/internal/scheduler/async';
import { Router } from '@angular/router';

@Injectable({ providedIn: "root" })
export class AuthService implements OnInit{
  private isAuthenticated = false;
  private token: string = '';
  private isAuthStatusListener= new Subject<boolean>();
  private tokenTimer: any;
  loginReqObj;
  loginResObj;

  constructor(
    private httpClient: HttpClient,
    private route: Router
  ){
  }

  ngOnInit() {

  }




  getAuthStatusListener() {
    return this.isAuthStatusListener.asObservable();
  }

  signup(username: string, email: string, password: string) {
    const user: User = {
      username: username,
      email: email,
      password: password
    }

    this.httpClient.post<{success: boolean, message: string}>('http://localhost:3000/signup', user)
    .subscribe((responseData) => {
      if(!responseData.success){
        console.log(responseData.message)
      }
      else{
        console.log(responseData.message)
      }
    })
  }

    login(){
    const user: User= {
      username: null,
      email: this.loginReqObj.email,
      password: this.loginReqObj.password
    }

    this.httpClient.post<{token: string, expiresIn: number}>('http://localhost:3000/login', user)
    .subscribe(
      response => {

        this.loginResObj = response;
        const token =  this.loginResObj.token;
        this.token = token
        this.isAuthenticated = true;

      if(token){
        const expiresInDuration = this.loginResObj.expiresIn;

        this.setAuthTimer(expiresInDuration)
        this.isAuthStatusListener.next(true);

        const nowTime = new Date();
        const expirationDate = new Date(nowTime.getTime() + expiresInDuration * 1000)
        this.saveAuth(token, expirationDate)

        this.route.navigate(['/']);
      }

    })
  }

  isUserLoggedIn() {
    if (localStorage.getItem('token') !== null) {
      this.token = localStorage.getItem('token');
      return true;
    } else {
      return false;
    }
  }

  logout(){
    this.token = null;
    this.isAuthenticated = false;
    clearTimeout(this.tokenTimer);
    this.isAuthStatusListener.next(false);
    this.removeAuth();
    this.route.navigate(['login'])
  }

  setAuthTimer(duration : number) {
    console.log("You will be logged out in --> " + duration)
    this.tokenTimer = setTimeout(() => {
      this.logout();
    }, duration * 1000)
  }

  saveAuth(token: string, expirationDate: Date) {
    localStorage.setItem('token', token)
    localStorage.setItem('expiration', expirationDate.toISOString())
  }

  removeAuth() {
    localStorage.removeItem('token');
    localStorage.removeItem('expiration');
  }

  autoAuthUser() {
    const authInformation = this.getAuthData();

    console.log(authInformation)

    if(!authInformation){
      return
    }
    const nowTime = new Date();
    const expiresIn = authInformation.expirationDate.getTime() - nowTime.getTime();

    if(expiresIn > 0) {
      this.token = authInformation.token;
      this.isAuthenticated = true;
      this.isAuthStatusListener.next(true);
      this.setAuthTimer(expiresIn/1000)
    }
  }



  getAuthData() {

    const token = localStorage.getItem('token');
    const expirationDate = localStorage.getItem('expiration')

    if(!token || !expirationDate){
      return
    }

    return {
      token : token,
      expirationDate : new Date(expirationDate)
    }

  }

  getIsAuth() {
    console.log(this.isAuthenticated)
    return this.isAuthenticated;
  }









  // async getLoginResponseData(email: string, password: string){
  //   let response = await this.login(email, password).toPromise();
  //   if(response){
  //     console.log(response.token)
  //     this.token = response.token
  //     console.log("Main hu 1st madharchod !")
  //     this.isAuthenticated = true
  //   }
  //   console.log(typeof this.token)
  //   return response.token
  // }

  // async loginProceed(email: string, password: string){
  //   let token = await this.getLoginResponseData(email, password);

  //   this.token = token;
  //   console.log(this.token)
  //   return token;
  // }




}
