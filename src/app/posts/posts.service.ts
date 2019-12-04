import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Subject } from 'rxjs';
import { map } from 'rxjs/operators';

import { Post } from './post.model';
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment';

const BACKEND_URL = 'https://giri-quiz-app.herokuapp.com/api/posts';

@Injectable({ providedIn: 'root' })
export class PostsService {
    private posts: Post[] = [];
    private postsUpdated = new Subject<{ posts: Post[], postCount: number }>();

    constructor(private http: HttpClient, private router: Router) { }

    getPosts(postsPerPage: number, currentPage: number) {
        const queryParams = `?pagesize=${postsPerPage}&page=${currentPage}`;
        this.http.get<{ message: string, posts: any, maxPosts: number }>(BACKEND_URL + queryParams)
            .pipe(map((postData) => {
                return {
                    posts: postData.posts.map(post => {
                        return {
                            question: post.question,
                            imagePath: post.imagePath,
                            optionA: post.optionA,
                            optionB: post.optionB,
                            optionC: post.optionC,
                            optionD: post.optionD,
                            correctAns: post.correctAns,
                            id: post._id
                        };
                    }),
                    maxPosts: postData.maxPosts
                };
            }))
            .subscribe((transformedPostData) => {
                this.posts = transformedPostData.posts;
                this.postsUpdated.next({ posts: [...this.posts], postCount: transformedPostData.maxPosts });
            });
    }

    getPostUpdateListener() {
        return this.postsUpdated.asObservable();
    }

    getPost(id: string) {
        return this.http.get<{
            _id: string,
            question: string,
            imagePath: string,
            optionA: string,
            optionB: string,
            optionC: string,
            optionD: string,
            correctAns: string
        }>(BACKEND_URL + '/' + id);
    }

    addPost(
        question: string,
        image: File,
        optionA: string,
        optionB: string,
        optionC: string,
        optionD: string,
        correctAns: string
    ) {
        const postData = new FormData();
        postData.append('question', question);
        postData.append('image', image);
        postData.append('optionA', optionA);
        postData.append('optionB', optionB);
        postData.append('optionC', optionC);
        postData.append('optionD', optionD);
        postData.append('correctAns', correctAns);

        this.http.post<{ message: string, post: Post }>(BACKEND_URL + '/', postData)
            .subscribe((responseData) => {
                this.router.navigate(['/']);
            });
    }

    updatePost(
        id: string,
        question: string,
        image: File | string,
        optionA: string,
        optionB: string,
        optionC: string,
        optionD: string,
        correctAns: string
    ) {
        let postData;
        if (typeof (image) === 'object') {
            postData = new FormData();
            postData.append('id', id);
            postData.append('question', question);
            postData.append('image', image);
            postData.append('optionA', optionA);
            postData.append('optionB', optionB);
            postData.append('optionC', optionC);
            postData.append('optionD', optionD);
            postData.append('correctAns', correctAns);
        } else {
            postData = {
                id,
                question,
                imagePath: image,
                optionA,
                optionB,
                optionC,
                optionD,
                correctAns
            };
        }
        this.http.put(BACKEND_URL + '/' + id, postData)
            .subscribe(response => {
                this.router.navigate(['/']);
            });
    }

    deletePost(postId: string) {
        return this.http.delete(BACKEND_URL + '/' + postId);
    }
}