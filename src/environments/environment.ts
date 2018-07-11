// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses `environment.ts`, but if you do
// `ng build --env=prod` then `environment.prod.ts` will be used instead.
// The list of which env maps to which file can be found in `.angular-cli.json`.

// IMPORTANT: Please replace these parameters with those for your own project
export const environment = {
  production: false,
  origin: 'http://localhost:4200',
  firebase: {
    apiKey: 'AIzaSyAnSP-8bk3r26fjvhZYWY-zPHo-LUydqPE',
    authDomain: 'togaimperial-com.firebaseapp.com',
    databaseURL: 'https://togaimperial-com.firebaseio.com',
    projectId: 'togaimperial-com',
    storageBucket: 'togaimperial-com.appspot.com',
    messagingSenderId: '527837741684'
  }
};
