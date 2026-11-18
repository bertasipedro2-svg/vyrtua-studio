const {defineConfig,devices}=require('@playwright/test');
module.exports=defineConfig({testDir:'./tests/browser',webServer:{command:'python3 -m http.server 4173 --bind 127.0.0.1',url:'http://127.0.0.1:4173'},use:{baseURL:'http://127.0.0.1:4173'},projects:[{name:'mobile-webkit',use:{...devices['iPhone 13']}},{name:'chromium',use:{...devices['Desktop Chrome']}}]});
