const rawDb = [
  {
    name: "The Mandelbrot set",
    fractalId: "mandelbrot",
    x: -0.7700865783521146,
    y: 0.0005149610839296841,
    w: 3.2541397276576007,
  },
  {
    name: "The seahorse valley",
    fractalId: "mandelbrot",
    x: -0.8850169319618038,
    y: 0.20430236940113136,
    w: 0.5341582685511642,
  },
  {
    name: 'Double-spirals on the left, "seahorses" on the right',
    fractalId: "mandelbrot",
    x: -0.761898850758455,
    y: 0.13624533125298993,
    w: 0.06172323608813737,
  },
  {
    name: '"Seahorse" upside down',
    fractalId: "mandelbrot",
    x: -0.7434670975470078,
    y: 0.1264225543830674,
    w: 0.01619893159287557,
  },
  {
    name: "Seahorse tail",
    fractalId: "mandelbrot",
    x: -0.7435575011333871,
    y: 0.13141411010448878,
    w: 0.0023624968121003496,
  },
  {
    name: "Part of the tail",
    fractalId: "mandelbrot",
    x: -0.7436534729475947,
    y: 0.13188172343759305,
    w: 0.0007349349876731434,
  },
  {
    name: "Satellite",
    fractalId: "mandelbrot",
    x: -0.7436414448061901,
    y: 0.13182674539039832,
    w: 0.00012108054070541848,
  },
  {
    name: "Satellite",
    fractalId: "mandelbrot",
    x: -0.7436431541413343,
    y: 0.13182586483571457,
    w: 0.000014770086109824968,
  },
  {
    name: '"Antenna" of the satellite',
    fractalId: "mandelbrot",
    x: -0.7436447696546592,
    y: 0.13182527423151064,
    w: 0.000002970883958121094,
  },
  {
    name: 'The "seahorse valley" of the satellite',
    fractalId: "mandelbrot",
    x: -0.7436441018154397,
    y: 0.13182604877870288,
    w: 6.725696241359014e-7,
  },
  {
    name: "Double-spirals",
    fractalId: "mandelbrot",
    x: -0.7436438803098491,
    y: 0.13182591847076758,
    w: 1.6094281332162775e-7,
  },
  {
    name: "Satellites of second order",
    fractalId: "mandelbrot",
    x: -0.7436438993338419,
    y: 0.13182589080585413,
    w: 5.0066736140673944e-8,
  },
  {
    name: "Island",
    fractalId: "mandelbrot",
    x: -0.7436438886058956,
    y: 0.13182590433282593,
    w: 4.1947898743490354e-9,
  },
  {
    name: "Double hook",
    fractalId: "mandelbrot",
    x: -0.7436438871772372,
    y: 0.13182590424946874,
    w: 6.117797120607018e-10,
  },
  {
    name: "Islands",
    fractalId: "mandelbrot",
    x: -0.7436438870371828,
    y: 0.13182590420568097,
    w: 5.260191508094819e-11,
  },
  {
    name: "Detail of one island",
    fractalId: "mandelbrot",
    x: -0.7436438870365094,
    y: 0.13182590421022766,
    w: 7.448163315952692e-12,
  },
  {
    name: "Detail of the spiral",
    fractalId: "mandelbrot",
    x: -0.7436438870357782,
    y: 0.13182590421248866,
    w: 4.2535996934475523e-13,
  },
  {
    name: "Frequency overload",
    fractalId: "tippetts",
    x: -0.7036494534576752,
    y: 0.39624415815626096,
    w: 0.0056686048452011415,
  },
  {
    name: "Crossroad",
    fractalId: "tippetts",
    x: 0.27818862424130375,
    y: -0.8136071097929828,
    w: 0.004360465265539319,
  },
  {
    name: "Yummy waves",
    fractalId: "tippetts",
    x: -1.4111616659280735,
    y: -0.0028525496453486393,
    w: 0.009579942188389867,
  },
];

export interface Poi {
  id: number;
  name: string;
  x: number;
  y: number;
  w: number;
}
interface Db {
  [fractalId: string]: Poi[];
}

let id = 0;

const buildDb = (): Db => {
  const res: Db = {};
  rawDb.sort((a, b) => a.w - b.w);
  rawDb.forEach(poi => {
    if (!(poi.fractalId in res)) res[poi.fractalId] = [];
    res[poi.fractalId].push({
      id: id++,
      name: poi.name,
      x: poi.x,
      y: poi.y,
      w: poi.w,
    });
  });
  return res;
};

export const poiDb: Db = buildDb();
