import { subDays, parse } from 'date-fns';

export const getParams = () => {

  var params = {
    1: {
      from: '07:30',
      to: '11:20'
    },
    2: {
      from: '07:30',
      to: '11:20'
    },
    3: {
      from: '07:30',
      to: '11:20'
    },
    4: {
      from: '07:30',
      to: '11:20'
    },
    5: {
      from: '07:30',
      to: '11:20'
    }
  };

  const param = params[2];
  if (param.length > 2) {
    return parse(`${param}`);
  } else if (param === '-1') {
    return subDays(new Date(), 1);
  } else {
    return new Date();
  }
};
