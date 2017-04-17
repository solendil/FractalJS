rm -fr ../solendil.github.io/fractaljs
cp -R dist/ ../solendil.github.io/fractaljs
cd ../solendil.github.io
git add -A
git commit -m "new version"
git push
cd -
