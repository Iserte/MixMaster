import app from './app';
import './routes';

import './listener';

app.login(process.env.APP_TOKEN);
