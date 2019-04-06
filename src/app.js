import Card from './card/card.js';
import CardEdit from './card/card-edit.js';
import Filters from './filters/filters.js';
import Statistic from './statistic/statistic.js';
import LocalModel from './local-model.js';
import Sorter from './sorter.js';
import TotalCost from './total-cost.js';

import {
  createElement
} from './utils.js';
import {
  NamesFilterDict
} from './filters/namesFilterDict.js';

const MESSAGE_STYLE = `style="width: 100%; text-align: center;"`;
const ESC_KEYCODE = 27;
const main = document.querySelector(`.main`);
const containerElementFilter = document.querySelector(`.trip-controls__menus.view-switch`);
const containerCards = document.querySelector(`.trip-day__items`);
const loading = createElement(`<p ${MESSAGE_STYLE}>Loading route...</p>`);
const error = createElement(`<p ${MESSAGE_STYLE}>Something went wrong while loading your route info. Check your connection or try again later</p>`);
let openedCards = [];
let activeLink = document.querySelector(`.view-switch__item--active`);

let localModel;
let filter;
const statistic = new Statistic([]);
const sorter = new Sorter();
sorter.setElement(main.querySelector(`.trip-sorting`));
const totalCost = new TotalCost();
totalCost.setElement(document.querySelector(`.trip__total-cost`));


export const init = (apiParams, storeParams) => {
  localModel = new LocalModel(apiParams, storeParams);

  containerCards.appendChild(loading);
  sorter.setOnchangeSort(renderWithConditions);

  localModel.init()
    .then(() => {
      if (localModel.getSavedData().length) {
        containerCards.removeChild(loading);
        renderBoardCards(localModel.getSavedData());
      }
    })
    .catch(() => {
      containerCards.removeChild(loading);
      containerCards.appendChild(error);
    });
};

const renderWithConditions = () => {
  if (!openedCards.length) {
    renderBoardCards(filter.filterOut(sorter.sort(localModel.getSavedData())));
  }
};

const renderFilters = (filterData) => {
  filter = new Filters(filterData);
  const formFilter = containerElementFilter.querySelector(`.trip-filter`);
  if (formFilter) {
    containerElementFilter.removeChild(formFilter);
  }
  containerElementFilter.appendChild(filter.render());

  filter.setOnChangeFilter(renderWithConditions);
};

renderFilters(NamesFilterDict);


const deleteCard = (cardEditInstance) => {
  cardEditInstance.disableView();
  cardEditInstance.changeTextOnButtonDelete(`Deleting...`);

  localModel.deletePoint(cardEditInstance.id)
    .then(() => {
      cardEditInstance.enableView();
      cardEditInstance.changeTextOnButtonDelete(`Delete`);
      openedCards = openedCards.filter(({cardEdit}) => cardEdit.id !== cardEditInstance.id);
      cardEditInstance.destroy();
      totalCost.render(localModel.getSavedData());
    })
    .catch(() => {
      cardEditInstance.enableView();
      cardEditInstance.changeTextOnButtonDelete(`Delete`);
      cardEditInstance.showError();
    });
};

// const closeOpenedCard = (cardEditInstance) => {
//   cardEditInstance.destroy();
// };

const onClickCard = (card) => {
  const cardEdit = new CardEdit(card.data, localModel.getSavedDestinations(), localModel.getSavedOffers());
  cardEdit.render();
  openedCards.push({cardEdit, card});
  card.replace(cardEdit);
  cardEdit.setOnSubmit((dataCard) => {
    card.saveChanges(dataCard);

    cardEdit.disableView();
    cardEdit.changeTextOnButtonSave(`Saving...`);

    localModel.updatePoint(dataCard)
      .then(() => {
        cardEdit.enableView();
        cardEdit.changeTextOnButtonSave(`Save`);
        openedCards = openedCards.filter(({cardEdit: elem}) => elem.id !== dataCard.id);
        card.render();
        cardEdit.replace(card);
        cardEdit.unrender();
        renderWithConditions();
      })
      .catch(() => {
        cardEdit.enableView();
        cardEdit.changeTextOnButtonSave(`Save`);
        cardEdit.showError();
      });
  });
  // cardEdit.setEcsPress(closeOpenedCard);
  cardEdit.setOnDelete(deleteCard);
  card.unrender();
};

const renderBoardCards = (data = localModel.getSavedData()) => {
  containerCards.innerHTML = ``;
  const fragment = document.createDocumentFragment();
  for (let element of data) {
    let card = new Card(element);
    card.setOnClick(onClickCard);
    fragment.appendChild(card.render());
  }
  containerCards.appendChild(fragment);
  totalCost.render(data);
};

const renderStatistic = () => {
  const elementStatistic = document.querySelector(`.statistic`);
  if (elementStatistic) {
    statistic.updateView();
  } else {
    document.body.appendChild(statistic.render());
  }
  statistic.renderCharts(localModel.getSavedData());
};

containerElementFilter.addEventListener(`click`, (e) => {
  const {target} = e;
  if (target.closest(`.view-switch__item`) && target !== activeLink) {
    e.preventDefault();
    activeLink.classList.remove(`view-switch__item--active`);
    target.classList.add(`view-switch__item--active`);
    activeLink = target;
    main.classList.toggle(`visually-hidden`);
    renderStatistic();
    statistic.changeStealthSwitch();
  }
});

window.addEventListener(`offline`, () => {
  document.title = `[OFFLINE] ${document.title}`;
});

window.addEventListener(`online`, () => {
  document.title = `Big Trip`;
  localModel.syncTasks();
});

document.addEventListener(`keydown`, (event) => {
  if (event.keyCode === ESC_KEYCODE) {
    const lastPair = openedCards.pop();
    lastPair.card.render();
    lastPair.cardEdit.replace(lastPair.card);
    lastPair.cardEdit.unrender();
  }
});
