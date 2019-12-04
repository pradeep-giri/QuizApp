import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';

import { Post } from '../post.model';
import { PostsService } from '../posts.service';
import { from } from 'rxjs';
import { PageEvent } from '@angular/material';

@Component({
    selector: 'app-post-list',
    templateUrl: './post-list.component.html',
    styleUrls: ['./post-list.component.css']
})
export class PostListComponent implements OnInit, OnDestroy {
    // posts = [
    //     { title: 'First Post', content: 'This is the first Post' },
    //     { title: 'Second Post', content: 'This is the second Post' },
    //     { title: 'Third Post', content: 'This is the third Post' }
    // ];
    posts: Post[] = [];
    totalPosts = 0;
    postsPerPage = 10;
    currentPage = 1;
    pageSizeOptions = [1, 2, 5, 10];
    isLoading = false;
    private postsSub: Subscription;

    postsService: PostsService;

    constructor(postsService: PostsService) {
        this.postsService = postsService;
    }

    ngOnInit() {
        this.isLoading = true;
        this.postsService.getPosts(this.postsPerPage, this.currentPage);
        this.postsSub = this.postsService.getPostUpdateListener()
            .subscribe((postData: { posts: Post[], postCount: number }) => {
                this.isLoading = false;
                this.totalPosts = postData.postCount;
                this.posts = postData.posts;
            });
    }

    onChangedPage(pageData: PageEvent) {
        this.isLoading = true;
        this.currentPage = pageData.pageIndex + 1;
        this.postsPerPage = pageData.pageSize;
        this.postsService.getPosts(this.postsPerPage, this.currentPage);
    }

    onDelete(postId: string) {
        this.isLoading = true;
        this.postsService.deletePost(postId).subscribe(() => {
            this.postsService.getPosts(this.postsPerPage, this.currentPage);
        });
    }

    ngOnDestroy() {
        this.postsSub.unsubscribe();
    }
}