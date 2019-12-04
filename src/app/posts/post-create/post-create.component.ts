import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { PostsService } from '../posts.service';
import { Post } from '../post.model';
import { mimeType } from './mime-type.validator';
import { Subscription } from 'rxjs';
import { AuthService } from 'src/app/auth/auth.service';


@Component({
    selector: 'app-post-create',
    templateUrl: './post-create.component.html',
    styleUrls: ['./post-create.component.css']
})

export class PostCreateComponent implements OnInit, OnDestroy {
    enteredQuestion = '';
    enteredOptionA = '';
    enteredOptionB = '';
    enteredOptionC = '';
    enteredOptionD = '';
    post: Post;
    isLoading = false;
    form: FormGroup;
    imagePreview: string;
    private mode = 'create';
    private postId: string;
    private authStatusSub: Subscription;


    constructor(public postsService: PostsService, public route: ActivatedRoute, private authService: AuthService) { }

    ngOnInit() {
        this.authStatusSub = this.authService.getAuthStatusListener().subscribe(
            authStatus => {
                this.isLoading = false;
            }
        );
        this.form = new FormGroup({
            question: new FormControl(null, {
                validators: [Validators.required, Validators.minLength(3)]
            }),
            image: new FormControl(null, {
                validators: [Validators.required],
                asyncValidators: [mimeType]
            }),
            optionA: new FormControl(null, { validators: [Validators.required] }),
            optionB: new FormControl(null, { validators: [Validators.required] }),
            optionC: new FormControl(null, { validators: [Validators.required] }),
            optionD: new FormControl(null, { validators: [Validators.required] }),
            correctAns: new FormControl(null, { validators: [Validators.required] })
        });
        this.route.paramMap.subscribe((paramMap: ParamMap) => {
            if (paramMap.has('postId')) {
                this.mode = 'edit';
                this.postId = paramMap.get('postId');
                this.isLoading = true;
                this.postsService.getPost(this.postId).subscribe(postData => {
                    this.isLoading = false;
                    this.post = {
                        id: postData._id,
                        question: postData.question,
                        imagePath: postData.imagePath,
                        optionA: postData.optionA,
                        optionB: postData.optionB,
                        optionC: postData.optionC,
                        optionD: postData.optionD,
                        correctAns: postData.correctAns
                    };
                    this.form.setValue({
                        question: this.post.question,
                        image: this.post.imagePath,
                        optionA: this.post.optionA,
                        optionB: this.post.optionB,
                        optionC: this.post.optionC,
                        optionD: this.post.optionD,
                        correctAns: this.post.correctAns
                    });
                });
            } else {
                this.mode = 'create';
                this.postId = null;
            }
        });
    }

    onImagePicked(event: Event) {
        const file = (event.target as HTMLInputElement).files[0];
        this.form.patchValue({ image: file });
        this.form.get('image').updateValueAndValidity();
        const reader = new FileReader();
        reader.onload = () => {
            this.imagePreview = reader.result as string;
        };
        reader.readAsDataURL(file);
    }

    onSavePost() {
        if (this.form.invalid) {
            return;
        }
        this.isLoading = true;
        if (this.mode === 'create') {
            this.postsService
                .addPost(
                    this.form.value.question,
                    this.form.value.image,
                    this.form.value.optionA,
                    this.form.value.optionB,
                    this.form.value.optionC,
                    this.form.value.optionD,
                    this.form.value.correctAns
                );

        } else {
            this.postsService
                .updatePost(
                    this.postId,
                    this.form.value.question,
                    this.form.value.image,
                    this.form.value.optionA,
                    this.form.value.optionB,
                    this.form.value.optionC,
                    this.form.value.optionD,
                    this.form.value.correctAns
                );
        }
        this.form.reset();
    }

    ngOnDestroy() {
        this.authStatusSub.unsubscribe();
    }
}