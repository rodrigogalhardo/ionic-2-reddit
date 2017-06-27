/**
 * 3D: DECLARATION, DECORATOR E DEFINITION.
 */

import { Component, OnInit, ViewChild } from '@angular/core';
import { NavController, LoadingController, ActionSheetController, Content } from 'ionic-angular';
import { Http } from '@angular/http';
import { InAppBrowser } from '@ionic-native/in-app-browser';
import { RedditService } from "../../providers/reddit-service/reddit-service";
import { FormControl } from '@angular/forms'

import 'rxjs/add/operator/map';
import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/distinctUntilChanged';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})

export class HomePage implements OnInit {

  @ViewChild(Content) content: Content;

  public feeds: Array<any>;
  private url: string = "https://www.reddit.com/new.json";
  private newerPosts: string = "https://www.reddit.com/new.json?before=";
  private olderPosts: string = "https://www.reddit.com/new.json?after=";

  public hasFilter: boolean = false;
  public noFilter: Array<any>;

  public searchTerm: string = '';
  public searchTermControl: FormControl;


  constructor(public navCtrl: NavController,
    public http: Http,
    public loadingCtrl: LoadingController,
    public iab: InAppBrowser,
    public actionSheetCtrl: ActionSheetController,
    public redditService: RedditService) {

    this.searchTermControl = new FormControl();
    this.searchTermControl.valueChanges.debounceTime(1000).distinctUntilChanged().subscribe(search => {
      if (search !== '' && search) {
        this.filterItems();
      }
    });

  }

  ngOnInit(): void {
    this.fetchContent();
  }


  fetchContent(): void {
    let loading = this.loadingCtrl.create({
      content: 'Fetching content...'
    });

    loading.present();

    this.redditService.fetchData(this.url).then(data => {
      this.feeds = data;
      this.noFilter = this.feeds;
      loading.dismiss();
    })


    // this.http.get(this.url).map(res => res.json())
    //   .subscribe(data => {
    //     this.feeds = data.data.children;

    //     this.feeds.forEach((e, i, a) => {
    //       if (!e.data.thumbnail || e.data.thumbnail.indexOf('b.thumbs.redditmedia.com') === -1) {
    //         e.data.thumbnail = 'http://www.redditstatic.com/icon.png';
    //       }
    //     });


    //     this.noFilter = this.feeds;

    //     loading.dismiss();
    //   });
  }

  filterItems(): void {
    this.hasFilter = false;
    this.feeds = this.noFilter.filter((item) => {
      return item.data.title.toLowerCase().indexOf(this.searchTerm.toLowerCase()) > -1;
    });
  }

  itemSelected(url: string): void {
    this.iab.create(url, "_system", "location=no,hardwareback=yes");
  }

  doRefresh(refresher): void {

    let paramsUrl = this.feeds[0].data.name;

    this.redditService.fetchData(this.newerPosts + paramsUrl).then(data => {
      this.feeds = data.concat(this.feeds);
      this.noFilter = this.feeds;
      this.hasFilter = false;
      refresher.complete();
    });

    // this.http.get(this.newerPosts + paramsUrl).map(res => res.json())
    //   .subscribe(data => {

    //     this.feeds = data.data.children.concat(this.feeds);

    //     this.feeds.forEach((e, i, a) => {
    //       if (!e.data.thumbnail || e.data.thumbnail.indexOf('b.thumbs.redditmedia.com') === -1) {
    //         e.data.thumbnail = 'http://www.redditstatic.com/icon.png';
    //       }
    //     })

    //     this.noFilter = this.feeds;
    //     this.hasFilter = false;

    //     refresher.complete();
    //   });
  }

  doInfinite(infiniteScroll): void {

    let paramsUrl = (this.feeds.length > 0) ? this.feeds[this.feeds.length - 1].data.name : "";

    this.redditService.fetchData(this.olderPosts + paramsUrl).then(data => {
      this.feeds = this.feeds.concat(data);
      this.noFilter = this.feeds;
      this.hasFilter = false;
      infiniteScroll.complete();
    })

    // this.http.get(this.olderPosts + paramsUrl).map(res => res.json())
    //   .subscribe(data => {

    //     this.feeds = this.feeds.concat(data.data.children);

    //     this.feeds.forEach((e, i, a) => {
    //       if (!e.data.thumbnail || e.data.thumbnail.indexOf('b.thumbs.redditmedia.com') === -1) {
    //         e.data.thumbnail = 'http://www.redditstatic.com/icon.png';
    //       }
    //     })

    //     this.noFilter = this.feeds;
    //     this.hasFilter = false;

    //     infiniteScroll.complete();
    //   });
  }

  showFilters(): void {
    this.content.scrollToTop();
    let actionSheet = this.actionSheetCtrl.create({
      title: 'Filter options:',
      buttons: [
        {
          text: 'Music',
          handler: () => {
            this.feeds = this.noFilter.filter((item) => item.data.subreddit.toLowerCase() === "music");
            this.hasFilter = true;
          }
        },
        {
          text: 'Movies',
          handler: () => {
            this.feeds = this.noFilter.filter((item) => item.data.subreddit.toLowerCase() === "movies");
            this.hasFilter = true;
          }
        },
        {
          text: 'Games',
          handler: () => {
            this.feeds = this.noFilter.filter((item) => item.data.subreddit.toLowerCase() === "gaming");
            this.hasFilter = true;
          }
        },
        {
          text: 'Pictures',
          handler: () => {
            this.feeds = this.noFilter.filter((item) => item.data.subreddit.toLowerCase() === "pics");
            this.hasFilter = true;
          }
        },
        {
          text: 'Ask Reddit',
          handler: () => {
            this.feeds = this.noFilter.filter((item) => item.data.subreddit.toLowerCase() === "askreddit");
            this.hasFilter = true;
          }
        },
        {
          text: 'Cancel',
          role: 'cancel',
          handler: () => {
            this.feeds = this.noFilter;
            this.hasFilter = false;
          }
        }
      ]
    });

    actionSheet.present();

  }

}