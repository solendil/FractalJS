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

const initDates = (storage) => {
  const min = moment.unix(storage.reduce((min, val) => {
    return Math.min(min, moment(val.date).unix());
  }, moment().unix())).day(1).startOf('day');
  const max = moment().add(1, 'year').day(1).startOf('day');
  const res = {};
  let m = min;
  while (m.isBefore(max)) {
    res[m.unix()] = {
      unix: m.unix(),
      dateh: m.format('ddd D MMM Y'),
      location: null,
      img: null,
    };
    m = m.add(1, 'd');
  }
  console.log(Object.keys(res).slice(0,10));
  storage.forEach((o) => {
    const d = moment.unix(o.unix);
    res[d.unix()] = {
      unix: d.unix(),
      dateh: m.format('ddd D MMM Y'),
      location: o.location,
      img: o.img,
    };
  });
  return res;
};

const saveScheduling = (dates) => {
  const toSave = Object.values(dates).filter(d => d.location);
  localStorage.setItem('schedule', JSON.stringify(toSave));
  const toSaveSimple = toSave.map(d => util.omit(d, 'img'));
  localStorage.setItem('schedule-simple', JSON.stringify(toSaveSimple));
  console.log(JSON.stringify(toSaveSimple))
};

export default new Vue({
  el: '#scheduler',
  data: {
    saved: [],
    saveByLoc: {},
    dates: initDates(JSON.parse(localStorage.getItem('schedule')) || []),
    selectedDate: null,
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
      date.location = null;
      date.img = null;
      saveScheduling(this.dates);
    },
    selectDate(date) {
      this.selectedDate = date.unix;
    },
    selectSave(save) {
      const date = this.dates[this.selectedDate];
      console.log('selectSave', save, this.selectedDate)
      if (date) {
        date.location = save.location;
        date.img = save.img;
        saveScheduling(this.dates);
      }
    },
    sortedDates() {
      return Object.values(this.dates).sort((a, b) => a.unix - b.unix);
    },
    isToday(date) {
      return moment.unix(date.unix).isSame(moment(), 'day');
    },
    isUsedCount(save) {
      return Object.values(this.dates).reduce((res, o) => {
        return res + (o.location === save.location) ? 1 : 0;
      }, 0);
    },
  }
});
