'use strict';

// Variables
const filter = document.querySelector('.friends-filter');
const filterInputs = document.querySelectorAll('.filter-field__input');
const friendsList = filter.querySelector('.friends-list--all ul');
const selectedFriendsList = filter.querySelector('.friends-list--selected ul');
const filterSaveBtn = filter.querySelector('.friends-filter__save');
let friends = [];
let currentDrag = null;

// Templates
const friendTemplate = ({photo_100, first_name, last_name, id}, selected) => `
  <div class="friends-list__item-pic">
    <img src="${photo_100}" alt="${first_name} ${last_name}" draggable="false">
  </div>
  <h4 class="friends-list__item-name">${first_name} ${last_name}</h4>
  ${selected ?
  (`<button class="friends-list__btn  friends-list__btn--remove" data-id="${id}" type="button">
    <span class="visually-hidden">Добавить</span>
  </button>`)
  :
  (`<button class="friends-list__btn  friends-list__btn--add" data-id="${id}" type="button">
    <span class="visually-hidden">Добавить</span>
  </button>`)
  }
`;

function renderFriends(data) {
  let friend = null;

  if (JSON.parse(localStorage.getItem('friends') || null)) {
    friends = JSON.parse(localStorage.getItem('friends'));
  }

  if (friends.length) {
    friends = friends.map(item => {
      friend = new Friend(item.data, item.isSelected);
      friend.render();

      return friend;
    });
  }
  else {
    data.forEach(item => {
      friend = new Friend(item);
      friend.render();

      friends.push(friend);
    });
  }

  selectInit();
  filterInit();
  dragInit();
  saveInit();
}

function selectInit() {
  filter.addEventListener('click', friendClickHandler);
  filter.addEventListener('dblclick', friendDoubleClickHandler);
}

function filterInit() {
  [...filterInputs].forEach(filter => filter.addEventListener('input', filterInputHandler));
}

function dragInit() {
  document.addEventListener('dragstart', friendDragStartHandler);
  document.addEventListener('dragover', friendDragOverHandler);
  document.addEventListener('drop', friendDropHandler);
  document.addEventListener('dragend', friendDragEndHandler);
}

function saveInit() {
  filterSaveBtn.addEventListener('click', saveBtnClickHandler);
}

function friendClickHandler(evt) {
  const target = evt.target.closest('.friends-list__btn');

  if (target) {
    const id = target.dataset.id;

    friends.some(friend => {
      if (friend.data.id === +id) {
        friend.isSelected = !friend.isSelected;
        friend.render();
      }
    });
  }
}

function friendDoubleClickHandler(evt) {
  const target = evt.target.closest('.friends-list__item');

  if (target) {
    const id = target.querySelector('[data-id]').dataset.id;

    friends.some(friend => {
      if (friend.data.id === +id) {
        friend.isSelected = !friend.isSelected;
        friend.render();
      }
    });
  }
}

function filterInputHandler() {
  const filterValue = this.value;
  const isSelected = JSON.parse(this.dataset.selected);

  friends.forEach(friend => {
    filterFriend(friend, filterValue, isSelected);
  });
}

function filterFriend(friend, value, isSelected) {
  const match = Helpers.isMatching(friend.data['first_name'], value) || Helpers.isMatching(friend.data['last_name'], value);

  if (friend.isSelected === isSelected) {
    match ? friend.render() : friend.remove();
  }
}

class Friend {
  constructor(data, selected) {
    this.data = data;
    this.isSelected = selected || false;
    this.element = null;
  }

  getElement() {
    const li = document.createElement('li');

    li.classList.add('friends-list__item');
    li.draggable = true;
    li.innerHTML = friendTemplate(this.data, this.isSelected);

    return li;
  };

  insert(beforeNode) {
    if (this.element) {
      this.remove();
    }

    this.element = this.getElement();

    if (this.isSelected) {
      selectedFriendsList.insertBefore(this.element, beforeNode);
    } else {
      friendsList.insertBefore(this.element, beforeNode);
    }
  }

  remove() {
    this.element.remove()
  };

  render() {
    if (this.element) {
      this.remove();
    }

    this.element = this.getElement();

    if (this.isSelected) {
      selectedFriendsList.appendChild(this.element);
      selectedFriendsList.scrollTop = selectedFriendsList.scrollHeight;
    } else {
      friendsList.appendChild(this.element);
    }
  }
}

class Placeholder {
  constructor() {
    this.element = (() => {
      const div = document.createElement('li');

      div.style.cssText = `
      width: 100%;
      height: 57px;
    `;

      return div;
    })();
  }

  add(where) {
    where.parentNode.insertBefore(this.element, where);
  };

  remove() {
    this.element.remove();
  };
}

const placeholder = new Placeholder();

function friendDragStartHandler(evt) {
  const zone = evt.target.closest('.drop-zone');

  if (zone) {
    currentDrag = {
      startZone: zone,
      node: evt.target.closest('.friends-list__item'),
    };
  }
}

function friendDragOverHandler(evt) {
  const zone = evt.target.closest('.drop-zone');

  if (zone) {
    const targetItem = evt.target.closest('.friends-list__item');

    evt.preventDefault();

    if (targetItem && currentDrag.startZone !== zone) {
      placeholder.add(targetItem);
    }
  }
}

function friendDropHandler(evt) {
  if (currentDrag) {
    const zone = evt.target.closest('.drop-zone');

    evt.preventDefault();

    if (zone && currentDrag.startZone !== zone) {
      let targetItem = evt.target.closest('.friends-list__item');
      const idd = +currentDrag.node.querySelector('[data-id]').dataset.id;
      let beforeNode = null;

      friends.some(friend => {
        if (friend.data.id === idd) {
          friend.isSelected = !friend.isSelected;

          if (targetItem) {
            beforeNode = targetItem.nextElementSibling;
            friend.insert(beforeNode);
          } else if (evt.target === placeholder.element) {
            beforeNode = placeholder.element.nextElementSibling;
            friend.insert(beforeNode);
          } else {
            friend.render();
          }
        }
      });
    }

    placeholder.remove();
  }
}

function friendDragEndHandler() {
  placeholder.remove();
}

function saveBtnClickHandler(evt) {
  evt.preventDefault();

  localStorage.setItem('friends', JSON.stringify(friends));
  alert('Данные сохранены!');
}

window.View = {
  renderFriends: renderFriends
};