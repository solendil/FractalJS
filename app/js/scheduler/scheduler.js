import Vue from 'vue';
import moment from 'moment';
import { KEY } from './saver';
import * as util from '../util/util';

const reload = (vue) => {
  vue.saved = JSON.parse(localStorage.getItem(KEY));
  vue.saved.forEach((save) => {
    save.img = localStorage.getItem(save.id);
  });
  vue.saveByLoc = vue.saved.reduce((obj, v) => {
    obj[v.location] = v;
    return obj;
  }, {});
};

const indexDates = (storage) => {
  return storage.reduce((obj, cur) => {
    obj[cur.date] = cur;
    return obj;
  }, {});
};

const saveScheduling = (dates) => {
  const toSave = Object.values(dates).filter(d => d.location);
  localStorage.setItem('schedule', JSON.stringify(toSave));
  const toSaveSimple = toSave.map(d => util.omit(d, 'img'));
  localStorage.setItem('schedule-simple', JSON.stringify(toSaveSimple));
};

export default new Vue({
  el: '#scheduler',
  data: {
    saved: [],
    saveByLoc: {},
    dates: indexDates(JSON.parse(localStorage.getItem('schedule')) || []),
    selectedDate: null,
    selectedSave: null,
  },
  mounted() {
    reload(this);
  },
  methods: {
    deleteItem(save) {
      let saved = JSON.parse(localStorage.getItem(KEY)) || [];
      saved = saved.filter(s => s.location !== save.location);
      localStorage.setItem(KEY, JSON.stringify(saved));
      localStorage.removeItem(save.id);
      reload(this);
    },
    clearAll() {
      localStorage.clear();
      reload(this);
    },
    clearDate(date) {
      delete date.location;
      delete date.img;
      saveScheduling(this.dates);
    },
    selectDate(date) {
      this.selectedDate = date.date;
      this.selectedSave = date.save;
    },
    selectSave(save) {
      const date = this.dates[this.selectedDate];
      if (date) {
        date.location = save.location;
        date.img = save.img;
        saveScheduling(this.dates);
      }
    },
    sortedDates() {
      return Object.values(this.dates).sort((a,b)=>{
        return a.sort - b.sort;
      });
    },
    genYear() {
      const now = moment();
      let date = now.day(1);
      const set = (date) => {
        const key = date.format().split('T')[0];
        const dateh = date.format('ddd D MMM');
        if (!this.dates[key]) {
          Vue.set(this.dates, key, {
            sort: date.unix(),
            date: key,
            dateh,
            location: null,
          });
        }
      }
      for (let i = 0; i < 52; i += 1) {
        set(date);
        date = date.add(2, 'd');
        set(date);
        date = date.add(2, 'd');
        set(date);
        date = date.add(3, 'd');
      }
    },
  }
});
