import {
  getMixedArray,
  getRandomInteger,
  parseTimeToString,
  getDuration
} from './utils.js';
import {
  TYPES_MAP
} from './trip-types.js';

const types = Object.keys(TYPES_MAP);

const destinations = [`Airport`,
  `Geneva`,
  `Chamonix`,
  `hotel`,
  `Gare Routière`,
  `Mausolée Brunswick`,
  `Scandale`
];

const prices = [10, 20, 40, 80];

const NUMBER_CARDS = 7;

const getMinutes = () =>
  getRandomInteger(0, 59) > 30 ? 30 : 0;

const getTime = () => {
  const startHour = getRandomInteger(0, 23);
  const endHour = getRandomInteger(startHour + 1, 24);
  return {
    startHour,
    startMinutes: getMinutes(),
    endHour,
    endMinutes: getMinutes()
  };
};

// const addZero = (number) =>
//   String(number).padStart(2, `0`);

// const parseTimeToString = ({startHour, startMinutes, endHour, endMinutes}) =>
//   `${addZero(startHour)}:${addZero(startMinutes)}&nbsp;&mdash; ${addZero(endHour)}:${addZero(endMinutes)}`;

// const getDuration = ({startHour, startMinutes, endHour, endMinutes}) => {
//   let hourDuration = endHour - startHour;
//   let minutesDuration = endMinutes - startMinutes;
//   if (minutesDuration < 0) {
//     hourDuration = hourDuration - 1;
//     minutesDuration = 60 + minutesDuration;
//   }
//   return `${hourDuration}h ${minutesDuration}m`;
// };

const Specials = [`Order UBER`,
  `Switch to comfort class`,
  `Add meal`,
  `Choose seats`,
  `Rent a car`,
  `Individual guide`];

const Text = [`Lorem ipsum dolor sit amet, consectetur adipiscing elit.`,
  `Cras aliquet varius magna, non porta ligula feugiat eget.`,
  `Fusce tristique felis at fermentum pharetra.`,
  `Aliquam id orci ut lectus varius viverra.`,
  `Nullam nunc ex, convallis sed finibus eget, sollicitudin eget ante.`,
  `Phasellus eros mauris, condimentum sed nibh vitae, sodales efficitur ipsum.`,
  `Sed blandit, eros vel aliquam faucibus, purus ex euismod diam, eu luctus nunc ante ut dui.`,
  `Sed sed nisi sed augue convallis suscipit in sed felis.`,
  `Aliquam erat volutpat.`,
  `Nunc fermentum tortor ac porta dapibus.`,
  `In rutrum ac purus sit amet tempus.`];

const getSrc = () => {
  let blockSrc = [];
  for (let i = 0; i < 8; i++) {
    blockSrc.push(`http://picsum.photos/300/150?r=${Math.random()}`);
  }
  return blockSrc;
};

let getDataCards = () => {
  let dataCards = [];
  for (let i = 1; i <= NUMBER_CARDS; i++) {
    const time = getTime();
    const dataCard = {
      id: i,
      type: types[getRandomInteger(0, types.length - 1)],
      destination: destinations[getRandomInteger(0, destinations.length - 1)],
      time: parseTimeToString(time),
      duration: getDuration(time),
      price: prices[getRandomInteger(0, prices.length - 1)],
      specials: getMixedArray(Specials).slice(0, getRandomInteger(0, 3))
        .map((name) => ({name, price: getRandomInteger(10, 100)})),
      text: getMixedArray(Text).slice(0, getRandomInteger(1, 3)),
      src: getSrc().slice(0, getRandomInteger(2, 8))
    };
    dataCards.push(dataCard);
  }
  return dataCards;
};

export const preparedData = getDataCards();
