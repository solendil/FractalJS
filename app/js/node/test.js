import moment from 'moment';
import fs from 'fs';
import Url from '../ui/url';
import * as fn from './functions';
import credentials from '../../../credentials/twitter';

console.log('-------------------------------------', moment().format());
const sches = fs.readFileSync(`${fn.getUserHome()}/.schedule.js`);
const sch = JSON.parse(sches);
const today = moment().startOf('day');
const todos = sch.filter(s => moment.unix(s.unix).startOf('day').isSame(today))
if (todos.length > 0) {
  const todo = todos[0];
  console.log('TODO found !', todo);
  const url = `http://solendil.github.io/fractaljs/${todo.location}`;
  const [desc, color] = Url.readCurrentScheme(todo.location);
  fn.renderOnCanvas(desc, color)
  .then(fn.getPngBuffer)
  .then(() => {
    fn.tweet(credentials, `#fractaljs featured picture ${url}`);
  });
}


