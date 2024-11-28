// script.js

function createSnowflake() {
  const calendar = document.getElementById('calendar');
  const snowflake = document.createElement('div');
  snowflake.className = 'snowflake';
  snowflake.textContent = '❄';
  snowflake.style.left = Math.random() * (calendar.offsetWidth + 100) - 100 + 'px';
  snowflake.style.animationDuration = Math.random() * 7 + 3 + 's';
  snowflake.style.fontSize = Math.random() * 10 + 10 + 'px';

  calendar.appendChild(snowflake);

  snowflake.addEventListener('animationend', () => {
    snowflake.classList.add('resting');
  });
}


async function createCalendar() {
  const calendar = document.getElementById('calendar');

  const centerDisplay = document.createElement('div');
  centerDisplay.id = 'center-display';
  calendar.appendChild(centerDisplay);

  centerDisplay.addEventListener('click', () => {
    centerDisplay.style.display = 'none'; // Versteckt den Text
  });

  const currentDate = new Date();
  const currentDay = currentDate.getDate();
  const month = currentDate.getMonth();

  if (month !== 11) {
    calendar.innerHTML = '<p>Es geth erst im Dezember los. :)</p>';
    return;
  }

  try {
    const response = await fetch('content.json');
    const data = await response.json();

    const openedDoors = JSON.parse(localStorage.getItem('openedDoors')) || [];
    let lastOpenedDoor = null;

    const positions = generatePositions(data.length, calendar.offsetWidth, calendar.offsetHeight, 90);

    data.forEach((item, index) => {
      const door = document.createElement('div');
      door.classList.add('door');
      door.textContent = item.day;

      door.style.left = `${positions[index].x}px`;
      door.style.top = `${positions[index].y}px`;

      const content = document.createElement('div');
      content.classList.add('door-content');
      content.textContent = item.content;

      if (item.link) {
        const link = document.createElement('a');
        link.href = item.link;
        link.textContent = "Mehr Infos";
        link.target = "_blank";
        link.style.display = 'block';
        link.style.marginTop = '10px';
        content.appendChild(link);
      }

      if (openedDoors.includes(item.day)) {
        door.classList.add('open');
      }

      door.addEventListener('click', () => {
        if (item.day <= currentDay) {
          for (let i = 0; i < 400; i++) {
            createSnowflake();
          }
          if (lastOpenedDoor) {
            lastOpenedDoor.classList.remove('last-open');
          }

          const rect = door.getBoundingClientRect();
          const centerRect = centerDisplay.getBoundingClientRect();

          centerDisplay.textContent = item.content;
          if (item.link) {
            const link = document.createElement('a');
            link.href = item.link;
            link.textContent = "Mehr Infos";
            link.target = "_blank";
            link.style.display = 'block';
            link.style.marginTop = '10px';
            centerDisplay.appendChild(link);
          }
          centerDisplay.style.display = 'block';

          centerDisplay.style.setProperty('--start-x', `${rect.left + rect.width / 2}px`);
          centerDisplay.style.setProperty('--start-y', `${rect.top + rect.height / 2}px`);
          centerDisplay.style.setProperty('--end-x', `${centerRect.left + centerRect.width / 2}px`);
          centerDisplay.style.setProperty('--end-y', `${centerRect.top + centerRect.height / 2}px`);
          centerDisplay.classList.add('moving');

          centerDisplay.addEventListener('animationend', () => {
            centerDisplay.classList.remove('moving');
          });

          if (!openedDoors.includes(item.day)) {
            openedDoors.push(item.day);
            localStorage.setItem('openedDoors', JSON.stringify(openedDoors));
          }

          door.classList.add('open');
          lastOpenedDoor = door;
        } else {
          alert("Bitte noch etwas Geduld. :)");
        }
      });

      door.appendChild(content);
      calendar.appendChild(door);
    });
  } catch (error) {
    console.error('Error loading calendar content:', error);
    calendar.innerHTML = '<p>Failed to load calendar content.</p>';
  }
}


function generatePositions(count, width, height, size) {
  let positions = [];
  let maxAttempts = 2500;
  let attempts = 0;

  while (positions.length < count) {
    const x = Math.random() * (width - size);
    const y = Math.random() * (height - size);

    const overlap = positions.some(
        pos => Math.abs(pos.x - x) < size && Math.abs(pos.y - y) < size
    );

    if (!overlap) {
      positions.push({ x, y });
      attempts = 0; 
    } else {
      attempts++; 
    }

    if (attempts > maxAttempts) {
      console.warn('Switching to fallback positioning...');

      positions = fallbackGridPositions(count, width, height, size);
      break; // Beende die while-Schleife, da die Fallback-Positionierung fertig ist
    }
  }

  return positions;
}

function fallbackGridPositions(count, width, height, size) {
  const positions = [];

  let cols = Math.floor(width / size);
  let rows = Math.ceil(count / cols);

  const totalWidth = cols * size;
  const totalHeight = rows * size;

  const horizontalPadding = (width - totalWidth) / 2;
  const verticalPadding = (height - totalHeight) / 2;

  let x = horizontalPadding;
  let y = verticalPadding;

  for (let i = 0; i < count; i++) {
    positions.push({ x, y });

    x += size;

    if (x + size > width - horizontalPadding) {
      x = horizontalPadding;
      y += size;
    }

    if (y + size > height - verticalPadding) {
      console.error('Not enough space in the fallback grid.');
      break;
    }
  }

  return positions;
}

createCalendar();
