let records = [
  {
    id: 1,
    username: 'jack',
    password: 'secret',
    displayName: 'Jack',
    emails: [{ value: 'jack@example.com' }],
    validatePassword: function(pwd, cb) {
      if (pwd !== this.password) cb(null, false);
      else cb(null, true);
    },
  },
  {
    id: 2,
    username: 'jill',
    password: 'birthday',
    displayName: 'Jill',
    emails: [{ value: 'jill@example.com' }],
    validatePassword: function(pwd, cb) {
      if (pwd !== this.password) cb(null, false);
      else cb(null, true);
    },
  },
];

exports.findById = function(id, cb) {
  process.nextTick(function() {
    let idx = id - 1;
    if (records[idx]) {
      cb(null, records[idx]);
    } else {
      cb(new Error('User ' + id + ' does not exist'));
    }
  });
};

exports.findByUsername = function(obj, cb) {
  process.nextTick(function() {
    for (let i = 0, len = records.length; i < len; i++) {
      let record = records[i];
      if (obj.username.test(record.username)) {
        return cb(null, record);
      }
    }
    return cb(null, null);
  });
};
