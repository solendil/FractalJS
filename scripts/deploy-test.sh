npm run build
rm -fr ../solendil.github.io/fractaljs-test
cp -R build/ ../solendil.github.io/fractaljs-test
cd ../solendil.github.io
git add -A
git commit -m "new version"
git push
cd -
