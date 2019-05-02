import Icon from '../Models/IconModel';

export const getIcon = name => new Promise((resolve, reject) => {
  Icon.find({ name }, (err, docs) => resolve(docs)).catch(err => reject(err));
});

export const createIcon = (name, uri) => new Promise((resolve, reject) => {
  const icon = new Icon({ name, uri });
  icon.save((e) => {
    if (e) {
      reject(e);
    }
    resolve(icon);
  });
});
