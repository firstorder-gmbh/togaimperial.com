// IProduct as an interface
export interface Article {
  _id: string; // document id = autoid
  assets: { // image urls
    [key: string]: string // 1 : url, 2 : url ...
  };
  available: boolean; // if article is available or not
  avatar: string; // avatar url
  descriptions: {
    [key: string]: { // language keys 'ar' | 'en' | 'de'
      [key: string]: string // multiple descriptions per language, sorted by key: 01 | 02 | 03 ... 99,
    };
  };
  headlines: { // language keys 'ar' | 'en' | 'de'
    [key: string]: string // one name per language
  };
  subtitles: { // language keys 'ar' | 'en' | 'de'
    [key: string]: string // one name per language
  };
  tags: { // tags used for search and filter
    [key: string]: boolean; // index key = true
  };
  updated: Date;
}
