(ns nanoscope.gradient)

(defn ^double huefrac [^double a ^double b]
  (cond
    (== b 0.0) 0.0
    (< b a) (/ b a)
    (== a 0.0) 2.0
    (< a b) (- 2.0 (/ a b))
    (== a b) 1.0))

(defn fast-rem
  "Fast remainder of double by double."
  ^double [^double d ^double denom]
  (- d (* denom (Math/floor (/ d denom)))))

(defn rgb->hsl
  "Converts rgb triplet in int-array 0-255 to hsl triplet in double-array 0.0-8.0
   -inf-inf -inf-inf. Hues: 0-7 = red, orange, yellow, yellow-green, green, cyan, blue,
   magenta. This spaces the hues more proportionately to how different they appear to
   humans, whose internal color representation resembles YCbCr, with red, yellow, green,
   and blue at cardinal positions on a hue wheel, more than it does RGB, despite the retina
   using RGB. Saturation and luminance range from -infinity to infinity, and are mapped
   into the more usual range for such via atan + an affine transformation."
  ^doubles [^ints rgb]
  (let [r (double (/ (aget rgb 0) 255.0))
        g (double (/ (aget rgb 1) 255.0))
        b (double (/ (aget rgb 2) 255.0))
        small (double (Math/min (Math/min r g) b))
        large (double (Math/max (Math/max r g) b))
        ^doubles hsl (double-array 3)]
    (cond
      (== large 0.0)
      (doto hsl (aset 2 Double/NEGATIVE_INFINITY))
      (== small 1.0)
      (doto hsl (aset 2 Double/POSITIVE_INFINITY))
      :else
      (let [l (double (/ (+ small large) 2.0))
            ll (double (- 1.0 (* 2.0 (Math/abs (- l 0.5)))))
            s (double (/ (- large small) ll))
            s (Math/max 0.0 (Math/min 1.0 s))
            rs (double (- r small))
            gs (double (- g small))
            bs (double (- b small))]
           (aset hsl 1 (Math/tan (* (- s 0.5) Math/PI)))
           (aset hsl 2 (Math/tan (* (- l 0.5) Math/PI)))
        (cond
          (== small r) (aset hsl 0 (+ 4.0 (huefrac gs bs)))
          (== small g) (aset hsl 0 (+ 6.0 (huefrac bs rs)))
          (== small b) (aset hsl 0 (* 2.0 (huefrac rs gs))))
        (aset hsl 0 (fast-rem (aget hsl 0) 8.0))
        hsl))))

(defn hsl->rgb
  "Converts hsl triplet in double-array 0.0-8.0 -inf-inf -inf-inf to rgb triplet in
   int-array 0-255. Hues: 0-7 = red, orange, yellow, yellow-green, green, cyan, blue,
   magenta. This spaces the hues more proportionately to how different they appear to
   humans, whose internal color representation resembles YCbCr, with red, yellow, green,
   and blue at cardinal positions on a hue wheel, more than it does RGB, despite the retina
   using RGB. Saturation and luminance range from -infinity to infinity, and are mapped
   into the more usual range for such via atan + an affine transformation."
  ^ints [^doubles hsl]
  (let [^doubles rgb (double-array 3)
        h (double (aget hsl 0))
        h (if (>= h 4.0) (- h 2.0) (/ h 2.0)) ; convert to standard 0-6 RYGCBM HSL space
        s-color (double (+ (/ (Math/atan (aget hsl 1)) (Math/PI)) 0.5))
        s-grey (double (* 0.5 (- 1.0 s-color)))
        l-color (double (/ (Math/atan (aget hsl 2)) (Math/PI)))
        lca (double (Math/abs l-color))
        l-white (double (+ l-color lca))
        l-color (double (- 1.0 (* 2.0 lca)))]
    (cond
      (< h 1.0) (doto rgb
                  (aset 0 1.0)
                  (aset 1 h))
      (< h 2.0) (doto rgb
                  (aset 0 (- 2.0 h))
                  (aset 1 1.0))
      (< h 3.0) (doto rgb
                  (aset 1 1.0)
                  (aset 2 (- h 2.0)))
      (< h 4.0) (doto rgb
                  (aset 1 (- 4.0 h))
                  (aset 2 1.0))
      (< h 5.0) (doto rgb
                  (aset 0 (- h 4.0))
                  (aset 2 1.0))
      :else     (doto rgb
                  (aset 0 1.0)
                  (aset 2 (- 6.0 h))))
    (doto rgb
      (aset 0 (+ (* (+ (* (aget rgb 0) s-color) s-grey) l-color) l-white))
      (aset 1 (+ (* (+ (* (aget rgb 1) s-color) s-grey) l-color) l-white))
      (aset 2 (+ (* (+ (* (aget rgb 2) s-color) s-grey) l-color) l-white)))
    (doto (int-array 3)
      (aset 0 (int (* 255 (aget rgb 0))))
      (aset 1 (int (* 255 (aget rgb 1))))
      (aset 2 (int (* 255 (aget rgb 2)))))))

(defn hsl-bias
  "Given two rgb triplets as double vectors, returns a triplet that has the colors
   blended according to the hsl bias rule. The hues are added in a circular manner,
   modulo 8.0; saturations and luminances are added.  Hues: 0-7 = red, orange, yellow,
   yellow-green, green, cyan, blue, magenta. This spaces the hues more proportionately to
   how different they appear to humans, whose internal color representation resembles YCbCr,
   with red, yellow, green, and blue at cardinal positions on a hue wheel, more than it does
   RGB, despite the retina using RGB. Saturation and luminance range from -infinity to
   infinity, and are mapped into the more usual range for such via atan + an affine
   transformation. The unusual HSL coordinates result in pointwise HSL addition not
   whiting or blacking out, but instead asymptotically approaching white or black, and
   similar asymptotic behavior with saturation, plus hue rotation that is more even than
   rotation applied directly to the 0-6 RYGCBM hue wheel; red and green are more perceptually
   different than green and blue, for example, so red to green should require a bigger
   magnitude of shift."
  ^doubles [^doubles hsl1 ^doubles hsl2]
  (doto (double-array 3)
    (aset 0 (fast-rem (+ (aget hsl1 0) (aget hsl2 0)) 8.0))
    (aset 1 (+ (aget hsl1 1) (aget hsl2 1)))
    (aset 2 (+ (aget hsl1 2) (aget hsl2 2)))))

(defn slx
  "Internal."
  ^double [^double x ^double y]
  (let [x (+ (/ (Math/atan x) (Math/PI)) 0.5)
        y (+ (/ (Math/atan y) (Math/PI)) 0.5)]
    (cond
      (zero? x) 0
      (zero? y) 0
      (== 1.0 x) 1.0
      (== 1.0 y) 1.0
      :else (let [
                  z (- 1 (/ (inc (* (dec (/ (- 1 x))) (dec (/ (- 1 y)))))))
                  z (max 0 (min 1 z))]
              (Math/tan (* (- z 0.5) Math/PI))))))

(defn hsl-bias-ufcompat
  "Similar to hsl-bias, but may give results closer to multiwave.ucl."
  ^doubles [^doubles hsl1 ^doubles hsl2]
  (doto (double-array 3)
    (aset 0 (fast-rem (+ (aget hsl1 0) (aget hsl2 0)) 8.0))
    (aset 1 (slx (aget hsl1 1) (aget hsl2 1)))
    (aset 2 (slx (aget hsl1 2) (aget hsl2 2)))))

(defn clamp255
  "Clamps a float into the range 0-255."
  ^double [^double x]
  (Math/min 255.0 (Math/max 0.0 x)))

(defn rgb->hsl2
  "Converts rgb triplet in int-array 0-255 to hsl triplet in double-array 0.0-8.0
   -inf-inf -inf-inf. Hues are mapped with red, yellow, green, blue, cyan, magenta
   evenly spaced along 0-8; otherwise the same as rgb->hsl. The latter should be
   preferred. This function is used internally by tricubic-gradient, which needs
   diametrically opposite 0-8 hues converted into diametrically opposite points in the
   RGB coordinate space for interpolation."
  ^doubles [^ints rgb]
  (let [r (double (/ (aget rgb 0) 255.0))
        g (double (/ (aget rgb 1) 255.0))
        b (double (/ (aget rgb 2) 255.0))
        small (double (Math/min (Math/min r g) b))
        large (double (Math/max (Math/max r g) b))
        ^doubles hsl (double-array 3)]
    (cond
      (== large 0.0)
      (doto hsl (aset 2 Double/NEGATIVE_INFINITY))
      (== small 1.0)
      (doto hsl (aset 2 Double/POSITIVE_INFINITY))
      :else
      (let [l (double (/ (+ small large) 2.0))
            ll (double (- 1.0 (* 2.0 (Math/abs (- l 0.5)))))
            s (double (/ (- large small) ll))
            s (Math/max 0.0 (Math/min 1.0 s))
            rs (double (- r small))
            gs (double (- g small))
            bs (double (- b small))]
           (aset hsl 1 (Math/tan (* (- s 0.5) Math/PI)))
           (aset hsl 2 (Math/tan (* (- l 0.5) Math/PI)))
        (cond
          (== small r) (aset hsl 0 (+ 2.0 (huefrac gs bs)))
          (== small g) (aset hsl 0 (+ 4.0 (huefrac bs rs)))
          (== small b) (aset hsl 0 (+ 0.0 (huefrac rs gs))))
        (aset hsl 0 (* 1.333333333333333 (fast-rem (aget hsl 0) 6.0)))
        hsl))))

(defn hsl->rgb2
  "Converts hsl triplet in double-array 0.0-8.0 -inf-inf -inf-inf to rgb triplet in
   int-array 0-255. Hues are mapped with red, yellow, green, blue, cyan, magenta
   evenly spaced along 0-8; otherwise the same as hsl->rgb. The latter should be
   preferred. This function is used internally by tricubic-gradient, which needs
   diametrically opposite 0-8 hues converted into diametrically opposite points in the
   RGB coordinate space for interpolation."
  ^ints [^doubles hsl]
  (let [^doubles rgb (double-array 3)
        h (/ (double (aget hsl 0)) 1.333333333333333)
        s-color (double (+ (/ (Math/atan (aget hsl 1)) (Math/PI)) 0.5))
        s-grey (double (* 0.5 (- 1.0 s-color)))
        l-color (double (/ (Math/atan (aget hsl 2)) (Math/PI)))
        lca (double (Math/abs l-color))
        l-white (double (+ l-color lca))
        l-color (double (- 1.0 (* 2.0 lca)))]
    (cond
      (< h 1.0) (doto rgb
                  (aset 0 1.0)
                  (aset 1 h))
      (< h 2.0) (doto rgb
                  (aset 0 (- 2.0 h))
                  (aset 1 1.0))
      (< h 3.0) (doto rgb
                  (aset 1 1.0)
                  (aset 2 (- h 2.0)))
      (< h 4.0) (doto rgb
                  (aset 1 (- 4.0 h))
                  (aset 2 1.0))
      (< h 5.0) (doto rgb
                  (aset 0 (- h 4.0))
                  (aset 2 1.0))
      :else     (doto rgb
                  (aset 0 1.0)
                  (aset 2 (- 6.0 h))))
    (doto rgb
      (aset 0 (+ (* (+ (* (aget rgb 0) s-color) s-grey) l-color) l-white))
      (aset 1 (+ (* (+ (* (aget rgb 1) s-color) s-grey) l-color) l-white))
      (aset 2 (+ (* (+ (* (aget rgb 2) s-color) s-grey) l-color) l-white)))
    (doto (int-array 3)
      (aset 0 (int (* 255 (aget rgb 0))))
      (aset 1 (int (* 255 (aget rgb 1))))
      (aset 2 (int (* 255 (aget rgb 2)))))))

(defn tricubic-gradient
  "Given some [h s l] triplets and a resolution, returns a function that takes a
   double between 0 and 1 and outputs an hsl triplet from a cyclic gradient that
   smoothly varies, passing through each of the input [h s l] triplets in turn at
   equal intervals and then returning to the first one. The resolution is an integer;
   the higher it is the more accurate the gradient is but the more memory it takes to
   store. Points are interpolated between the input control points using tricubic Bezier
   splines."
  ^clojure.lang.IFn$DO [resolution hsl & hsls]
  (let [resolution (int resolution)
        ^objects colorshsl (into-array (map double-array (cons hsl hsls)))
        ^objects colorsrgb (into-array (map hsl->rgb2 colorshsl))
        numc (double (alength colorshsl))
        p2 (double (/ 1.0 numc))
        ^objects data (into-array
                        (for [i (range resolution)]
                          (let [fval (double (/ i resolution))
                                b (int (Math/floor (/ fval p2)))
                                a (int (fast-rem (dec b) numc))
                                c (int (fast-rem (inc b) numc))
                                d (int (fast-rem (inc c) numc))
                                fval (double (/ (fast-rem fval p2) p2))
                                ^ints a (aget colorsrgb a)
                                ^ints b (aget colorsrgb b)
                                ^ints c (aget colorsrgb c)
                                ^ints d (aget colorsrgb d)
                                rp0 (double (aget b 0))
                                gp0 (double (aget b 1))
                                bp0 (double (aget b 2))
                                rm0 (double (/ (- (aget c 0) (aget a 0)) 2))
                                gm0 (double (/ (- (aget c 1) (aget a 1)) 2))
                                bm0 (double (/ (- (aget c 2) (aget a 2)) 2))
                                rp1 (double (aget c 0))
                                gp1 (double (aget c 1))
                                bp1 (double (aget c 2))
                                rm1 (double (/ (- (aget d 0) (aget b 0)) 2))
                                gm1 (double (/ (- (aget d 1) (aget b 1)) 2))
                                bm1 (double (/ (- (aget d 2) (aget b 2)) 2))
                                ffval (double (* fval fval))
                                ffval3 (double (* 3 ffval))
                                fffval (double (* fval ffval))
                                fffval2 (double (* 2 fffval))
                                fa (double (inc (- fffval2 ffval3)))
                                fb (double (+ (- fffval (* 2 ffval)) fval))
                                fc (double (- ffval3 fffval2))
                                fd (double (- fffval ffval))]
                            (rgb->hsl2
                              (doto (int-array 3)
                                (aset 0 (int
                                          (clamp255
                                            (+
                                              (+ (* fa rp0) (* fb rm0))
                                              (+ (* fc rp1) (* fd rm1))))))
                                (aset 1 (int
                                          (clamp255
                                            (+
                                              (+ (* fa gp0) (* fb gm0))
                                              (+ (* fc gp1) (* fd gm1))))))
                                (aset 2 (int
                                          (clamp255
                                            (+
                                              (+ (* fa bp0) (* fb bm0))
                                              (+ (* fc bp1) (* fd bm1)))))))))))]
    (fn [^double fval]
      (aget data (int (* fval resolution))))))

(defn tricubic-gradient-rgb
  "Like tricubic-gradient, but accepts rgb triplets instead of hsl triplets"
  ^clojure.lang.IFn$DO [resolution rgb & rgbs]
  (apply tricubic-gradient resolution (map (comp rgb->hsl int-array) (cons rgb rgbs))))

(defn tricubic-gradient-np
  "Non-precomputed version of tricubic-gradient."
  ^clojure.lang.IFn$DO [hsl & hsls]
  (let [^objects colorshsl (into-array (map double-array (cons hsl hsls)))
        ^objects colorsrgb (into-array (map hsl->rgb2 colorshsl))
        numc (double (alength colorshsl))
        p2 (double (/ 1.0 numc))]
    (fn [^double fval]
      (let [b (int (Math/floor (/ fval p2)))
            a (int (fast-rem (dec b) numc))
            c (int (fast-rem (inc b) numc))
            d (int (fast-rem (inc c) numc))
            fval (double (/ (fast-rem fval p2) p2))
            ^ints a (aget colorsrgb a)
            ^ints b (aget colorsrgb b)
            ^ints c (aget colorsrgb c)
            ^ints d (aget colorsrgb d)
            rp0 (double (aget b 0))
            gp0 (double (aget b 1))
            bp0 (double (aget b 2))
            rm0 (double (/ (- (aget c 0) (aget a 0)) 2))
            gm0 (double (/ (- (aget c 1) (aget a 1)) 2))
            bm0 (double (/ (- (aget c 2) (aget a 2)) 2))
            rp1 (double (aget c 0))
            gp1 (double (aget c 1))
            bp1 (double (aget c 2))
            rm1 (double (/ (- (aget d 0) (aget b 0)) 2))
            gm1 (double (/ (- (aget d 1) (aget b 1)) 2))
            bm1 (double (/ (- (aget d 2) (aget b 2)) 2))
            ffval (double (* fval fval))
            ffval3 (double (* 3 ffval))
            fffval (double (* fval ffval))
            fffval2 (double (* 2 fffval))
            fa (double (inc (- fffval2 ffval3)))
            fb (double (+ (- fffval (* 2 ffval)) fval))
            fc (double (- ffval3 fffval2))
            fd (double (- fffval ffval))]
        (rgb->hsl2
          (doto (int-array 3)
            (aset 0 (int
                      (clamp255
                        (+
                          (+ (* fa rp0) (* fb rm0))
                          (+ (* fc rp1) (* fd rm1))))))
            (aset 1 (int
                      (clamp255
                        (+
                          (+ (* fa gp0) (* fb gm0))
                          (+ (* fc gp1) (* fd gm1))))))
            (aset 2 (int
                      (clamp255
                        (+
                          (+ (* fa bp0) (* fb bm0))
                          (+ (* fc bp1) (* fd bm1))))))))))))

(defn meta-tricubic-gradient
  "Interpolates among gradients. First two parameters are the periods of the nested gradients
   -- the passed-in gradients cycles completely after the first period, between 0 and 1, and
   these shade from one to another every second period. To convert from
   multiwave.ucl's short and long hue shift periods, the first period should be
   short/(lcm short long) and the second should be long/(lcm short long); the period for the
   metagradient in a multiwave-color invocation should be (lcm short long)."
  ^clojure.lang.IFn$DO [period1 period2 & gs]
  (fn [^double fval]
    (let [fval1 (/ (rem fval period1) period1)
          fval2 (/ (rem fval period2) period2)]
      ((apply tricubic-gradient-np (map #(% fval1) gs)) fval2))))

(defn linear-gradient
  "Interpolates linearly between [position [h s l]] or [position [r g b]]; positions go from
   0 to 1. The initial triplet is at 0 and if none is at 1, then it assumes the same triplet
   at 1, making the gradient seamlessly circular."
  ^clojure.lang.IFn$DO [resolution rgb? zero-triplet & pos-triplets]
  (let [triplets (cons [0.0 zero-triplet] pos-triplets)
        triplets (if rgb?
                   triplets
                   (map (fn [[pos triplet]] [pos (hsl->rgb2 triplet)]) triplets))
        triplets (concat triplets [[1.0 (second (first triplets))]])
        calc (fn [^double fval]
               (let [[ppos [pr pg pb]] (first triplets)]
                 (loop [ppos ppos pr pr pg pg pb pb triplets (next triplets)]
                   (if-let [[[pos [r g b]] & more] triplets]
                     (if (< fval pos)
                       (let [fval (/ (- fval ppos) (- pos ppos))
                             pfval (- 1.0 fval)]
                         (rgb->hsl2
                           (doto (int-array 3)
                             (aset 0 (int
                                       (clamp255
                                         (+ (* pfval pr) (* fval r)))))
                             (aset 1 (int
                                       (clamp255
                                         (+ (* pfval pg) (* fval g)))))
                             (aset 2 (int
                                       (clamp255
                                         (+ (* pfval pb) (* fval b))))))))
                       (recur pos r g b more))))))
        ^objects data (into-array
                        (for [i (range resolution)]
                          (calc (double (/ i resolution)))))]
    (fn [^double fval]
      (aget data (int (* fval resolution))))))

(defn double-identity
  "Primitive double version of identity."
  ^double [^double x]
  x)

(defn double-log
  "Primitive double logarithm."
  ^double [^double x]
  (Math/log x))

(defn multiwave-color
  "Given a set of coloring parameters, returns a function that takes a double
   and outputs an hsl triplet double-array using the multiwave color scheme specified
   by the parameters:
   gradient - a gradient such as output by tricubic-gradient: should repeat as the
              input cycles from 0 to 1 and back to 0.
   period - how often this wave repeats as a function of the scalar field. If nil, but
            start and end supplied, gradient will be stretched exactly once between
            start and end.
   blend - a rule for blending this wave with the preceding waves, for which hsl-bias
           is recommended and is the default.
   mapping - a function that defaults to double-identity but can be a logarithm or other
             transformation. It MUST have a ^double [^double x] hinted arity!
   start - this wave's first value is used for everything lower than start.
           The wave then proceeds rotating through the gradient from there,
           unless start is -INF, in which case the gradient is phase-aligned as if start
           was 0. Default -INF.
   end - this wave's last value is used for everything higher than end. Default +INF.
   Waves are applied in the order specified."
  ^clojure.lang.IFn$DO [[^clojure.lang.IFn$DO gradient period blend mapping start end]
                        & more-waves]
  (let [blend (if blend blend hsl-bias)
        ^clojure.lang.IFn$DD mapping (if mapping mapping double-identity)
        start (double (if start (mapping start) Double/NEGATIVE_INFINITY))
        start2 (double (if (> start Double/NEGATIVE_INFINITY) start 0.0))
        end (double (if end (mapping end) Double/POSITIVE_INFINITY))
        period (double (if period period (- end start)))
        ^clojure.lang.IFn$DOO more-waves (if more-waves
                                           (apply multiwave-color more-waves))]
    (fn mwc ^doubles
      ([^double fval]
        (mwc fval nil))
      ([^double fval ^doubles prev-hsl]
        (let [fval2 (double (.invokePrim mapping fval))
              fval2 (double (Math/max start (Math/min end fval2)))
              fval2 (double (/ (fast-rem (- fval2 start2) period) period))
              hsl (.invokePrim gradient fval2)
              hsl (if prev-hsl
                    (blend prev-hsl hsl)
                    hsl)]
          (if more-waves
            (.invokePrim more-waves fval hsl)
            hsl))))))

(def multiwave-default
  (multiwave-color
    [(tricubic-gradient 16384 [0 0 0] [7.5 0 -3] [6.5 -3 0] [7.5 0 3]) 1000]
    [(tricubic-gradient 16384 [0 0 0] [7.5 -2 -2] [0.5 2 2]) 30]
    [(tricubic-gradient 16384 [0 0 0] [0 -1 -2] [0 0 0] [0 1 2]) 120]
    [(tricubic-gradient 16384 [0 0 0] [1 0 0] [2 0 0] [3 0 0] [4 0 0]
                              [5 0 0] [6 0 0] [7 0 0]) 1e6]
    [(tricubic-gradient 16384 [0 0 0] [2.5 3 -5] [3.5 5 -2] [2 -4 4] [0.5 4 2]) 3500]))

(def multiwave-simple
  (multiwave-color
    [(tricubic-gradient 16384 [0 0 0] [7.5 -5 -5] [6.5 0 0] [7.5 5 5]) 100]))


(def g-spdz2
  (multiwave-color
    [(meta-tricubic-gradient
       0.02127659574468085 8E-4
       (tricubic-gradient-rgb
         16384 [15 91 30]  [60 62 128]   [71 37 95]    [45 45 53]    [64 62 80])
       (tricubic-gradient-rgb
         16384 [56 240 80] [187 141 199] [142 128 146] [24 24 164]   [135 155 171])
       (tricubic-gradient-rgb
         16384 [74 186 77] [73 0 92]     [195 130 234] [151 149 189] [175 199 196])
       (tricubic-gradient-rgb
         16384 [29 39 227] [225 33 255]  [9 95 233]    [120 84 100]  [21 33 123]))
     1175000 hsl-bias-ufcompat]
    [(tricubic-gradient-rgb 16384 [192 64 64] [192 64 64] [81 71 71]) 5000
     hsl-bias-ufcompat]
    [(tricubic-gradient-rgb 1024 [199 83 83] [192 64 64] [172 58 58] [192 64 64]) 10
     hsl-bias-ufcompat]
    [(tricubic-gradient-rgb 1024 [211 121 121] [192 64 64] [135 45 45] [192 64 64]) 17
     hsl-bias-ufcompat]
    [(tricubic-gradient-rgb 1024 [243 217 217] [192 64 64] [39 13 13] [192 64 64]) 2544
     hsl-bias-ufcompat]
    [(tricubic-gradient-rgb 1024 [192 64 64] [76 26 26] [192 64 64] [231 179 179]) 235
     hsl-bias-ufcompat]
    [(linear-gradient 1024 true [11 25 12] [0.375 [192 64 64]] [0.5875 [192 64 64]]
                        [0.6125 [179 177 177]] [0.69 [128 237 19]] [0.7 [78 99 102]]
                        [0.7025 [63 53 131]] [0.715 [0 153 180]] [0.74 [4 154 184]]
                        [0.7475 [204 34 190]] [0.7875 [216 194 195]] [0.8325 [183 154 61]]
                        [1.0 [243 227 234]]) nil hsl-bias-ufcompat double-log 1 16777216]))