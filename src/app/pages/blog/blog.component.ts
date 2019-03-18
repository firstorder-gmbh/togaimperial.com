import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { AngularFirestore, AngularFirestoreDocument } from '@angular/fire/firestore';
import { Component, Inject, Input, OnDestroy, PLATFORM_ID } from '@angular/core';
import { debounceTime, map, switchMap, takeUntil } from 'rxjs/operators';
import { Direction } from '@angular/cdk/bidi';
import { firestore } from 'firebase';
import { isPlatformBrowser } from '@angular/common';
import { makeStateKey, StateKey, TransferState } from '@angular/platform-browser';
import { BehaviorSubject, combineLatest, of, Subject } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';

import { Article } from './blog.model';
import { FooterService } from './../../shared/footer/footer.service';
import { HeaderService } from './../../shared/header/header.service';
import { LanguageService } from './../../shared/i18n/language.service';

@Component({
  selector: 'app-blog',
  templateUrl: './blog.component.html',
  styleUrls: ['./blog.component.scss']
})
export class BlogComponent implements OnDestroy {

  article$: BehaviorSubject<Article>; // selected article
  articleId$: BehaviorSubject<string | null>; // selected article id
  articles$: BehaviorSubject<Array<Article>>; // articles list
  currentLang: string;
  @Input() dir: Direction;
  headline: string;
  ngDestroy$ = new Subject();
  search$: BehaviorSubject<string | null>; // current search tag
  selectedArticle: Article;

  private articleDoc: AngularFirestoreDocument<Article>;

  constructor(
    protected angularFirestore: AngularFirestore,
    protected translate: TranslateService,
    private footerService: FooterService,
    private headerService: HeaderService,
    private languageService: LanguageService,
    @Inject(PLATFORM_ID) private platformId: Object,
    private route: ActivatedRoute,
    private router: Router,
    private transferState: TransferState
  ) {
    this.footerService.footerClass$.next(null);
    this.headerService.headerClass$.next(null);
    this.headerService.headerTitle$.next('BLOG.TITLE');

    this.languageService.dir$.subscribe(dir => this.dir = dir);

    const keyArticles: StateKey<number> = makeStateKey<number>('transfer-state-articles');
    const keyArticle: StateKey<number> = makeStateKey<number>('transfer-state-article');
    const stateArticle = this.transferState.get(keyArticle, null);

    this.article$ = new BehaviorSubject(null);
    this.articleId$ = new BehaviorSubject(null);
    this.articles$ = new BehaviorSubject(null);
    this.search$ = new BehaviorSubject(null);

    // First we are looking in transfer-state, if nothing found we read from firestore
    if (stateArticle) {
      this.articles$.next(stateArticle);
    } else {
      // Get article list by current search tag
      combineLatest(
        this.search$
      ).pipe(
        debounceTime(300), // delay execution to reduce api calls
        switchMap(([search]) => {
          // if (tag) {
            return this.angularFirestore.collection('articles', ref => {
              let query: firestore.CollectionReference | firestore.Query = ref;
              if (search) {
                // query all search words (or tags),
                // only client sorting is feasible as we don't want to create a composite index for each tag
                for (const tag of search.split(' ')) {
                  query = query.where('available', '==', true).where(`tags.${tag}`, '==', true);
                }
              } else {
                // search empty, so we can sort results after creating only one composite index
                query = query
                  .where('available', '>=', true).orderBy('available', 'asc');
              }

              // return only first 100 results
              return query.limit(100);
            }).snapshotChanges()
            .pipe(
              takeUntil(this.ngDestroy$),
              map(actions => actions.map(a => {
                const _id = a.payload.doc.id;
                const data = a.payload.doc.data() as Article;

                return { _id, ...data };
              }))
            );
          // } else {
            // return of([]);
          // }
        })
      ).subscribe((articles: Array<Article>) => {
        if (!isPlatformBrowser(this.platformId)) { // write transfer state if on the server
          this.transferState.set(keyArticles, articles);
        }
        this.articles$.next(articles);
      });
    }

    // First we are looking in transfer-state, if nothing found we read from firestore
    if (stateArticle) {
      this.article$.next(stateArticle);
    } else {
      // Get current article by articleId
      combineLatest(
        this.articleId$
      ).pipe(
        debounceTime(300), // delay execution to reduce api calls
        switchMap(([articleId]) => {
          if (articleId) {
            this.articleDoc = this.angularFirestore.doc<Article>(`articles/${articleId}`);

            return this.articleDoc.snapshotChanges()
            .pipe(
              takeUntil(this.ngDestroy$),
              map(a => {
                const _id = a.payload.id;
                const data = a.payload.data();

                return { _id, ...data };
              })
            );
          } else {
            this.articleDoc = null;

            return of(null);
          }
        })
      ).subscribe((article: Article) => {
        this.article$.next(article);
        if (!isPlatformBrowser(this.platformId)) { // write transfer state if on the server
          this.transferState.set(keyArticle, article);
        }
      });
    }

    this.article$
    .pipe(takeUntil(this.ngDestroy$))
    .subscribe((article: Article) => {
      this.selectedArticle = article;
      this.setHeadline(article);
      // this.headerService.activeHeader$.value.showContextualHeader = !!this.selectedArticle;
    });

    this.route.paramMap.pipe(
      switchMap((params: ParamMap) =>
        of(params.get('_id'))
      )
    ).subscribe((_id: string) => {
      this.articleId$.next(_id);
      if (!_id) {
        this.headerService.headerTitle$.next('BLOG.TITLE');
      }
      // this.sidenavService.contentClass.next(id ? 'position-absolute' : null);
    });

    translate.onLangChange
    .pipe(takeUntil(this.ngDestroy$))
    .subscribe(() => {
      this.currentLang = translate.currentLang;
      this.setHeadline(this.selectedArticle);
    });
  }

  cancel(): void {
    // this.sidenavService.contentClass.next(null);
    this.selectedArticle = null;
    // this.headerService.activeHeader$.value.showContextualHeader = false;
    void this.router.navigate(['/blog']);
  }

  ngOnDestroy(): void {
    this.ngDestroy$.next();
    this.ngDestroy$.complete();
    // Clear the data loaded in the service
    this.article$.next(undefined);
    this.articles$.next(undefined);
  }

  openArticle(article: Article): void {
    // this.sidenavService.contentClass.next('position-absolute');
    void this.router.navigate(['/blog', article._id]);
  }

  setHeadline(article: Article): void {
    if (this.selectedArticle) {
      this.headline = article.headlines[this.currentLang] || article.headlines['en'];
      this.headerService.headerTitle$.next(this.headline);
    }
  }

  // https://angular.io/guide/template-syntax#ngfor-with-trackby
  trackByArticles(index: number, article: Article): string {
    return article._id;
  }
}
