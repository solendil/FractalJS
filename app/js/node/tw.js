import Twitter from 'twitter';
import fs from 'fs';
import credentials from '../../../credentials/twitter-test';

const data = fs.readFileSync('/Users/work/github/FractalJS3/bg.png');

function tweet(credentials, text, imageBuffer) {
  return new Promise((resolve, reject) => {
    const client = new Twitter(credentials);
    client.post('media/upload', { media: imageBuffer }, (error, media, response) => {
      if (!error) {
        const status = {
          status: text,
          media_ids: media.media_id_string,
        };
        client.post('statuses/update', status, (error, tweet, response) => {
          if (!error) {
            console.log(tweet);
            resolve(tweet);
          }
        });
      }
    });
  });
}

tweet(
  credentials,
  '#fractaljs of the day : http://solendil.github.io/fractaljs/#Bt_0&x_-1.2540029875890244&y_0.05282937770621174&w_0.002725290790962088&i_383&fs_1&ct_0&co_22&cd_0.35',
  data,
);

