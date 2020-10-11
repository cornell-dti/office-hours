import * as express from 'express';

import * as functions from './firebasefunctions';

const app = express();

app.put('create-series', (req, res) => {
    functions.createSeries();
})

app.put('update-series', (req, res) => {
    functions.updateSeries();
})

app.put('delete-series', (req, res) => {
    functions.deleteSeries();
})

app.put('get-user-role-update', (req, res) => {
    
})

app.put('get-course-role-update', (req, res) => {
    
})

app.put('get-course-role-updates', (req, res) => {
    
})

app.put('import-professors-or-tas', (req, res) => {
    
})

app.put('add-or-remove-from-roleid-list', (req, res) => {
    
})

app.put('change-role', (req, res) => {
    
})

app.put('import-professors-or-tas-from-prompt', (req, res) => {
    
})

app.put('update-virtual-location', (req, res) => {
    
})

/* User Management Functions */




















