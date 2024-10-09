const reponse = await fetch('http://localhost:5678/api/works');
let works = [];
works = await reponse.json();

let imageFile = null;

console.log('works', works);

/* *** Ajouter à la galerie les travaux de l'architecte */
function genererProjets(works) {
  // Récupérer gallery
  const divGallery = document.querySelector('.gallery');
  // Vider gallery à chaque filtre
  divGallery.innerHTML = '';

  for (let i = 0; i < works.length; i++) {
    const article = works[i];

    const projetElement = document.createElement('figure');

    const imageElement = document.createElement('img');
    imageElement.src = article.imageUrl;

    const captionElement = document.createElement('figcaption');
    captionElement.innerText = article.title;

    divGallery.appendChild(projetElement);
    projetElement.appendChild(imageElement);
    projetElement.appendChild(captionElement);
  }
}

// Afficher Projets
genererProjets(works);

/* *** Ajouter des filtres */

const btnFiltrerTous = document.getElementById('btn__tous');
btnFiltrerTous.addEventListener('click', () => {
  const filtrerTous = works.slice();

  genererProjets(filtrerTous);
});

// Filtrer Objets
const btnFiltrerObjets = document.getElementById('btn__objets');
btnFiltrerObjets.addEventListener('click', () => {
  const filtreObjets = works.filter(function (work) {
    return work.category.name === 'Objets';
  });
  genererProjets(filtreObjets);
});

// Filtrer Appartements
const btnFiltrerAppartements = document.getElementById('btn__appartements');
btnFiltrerAppartements.addEventListener('click', () => {
  const filtrerAppartements = works.filter(function (work) {
    return work.category.name === 'Appartements';
  });
  genererProjets(filtrerAppartements);
});

// Filtrer Hôtels & restaurants
const btnFiltrerHotels = document.getElementById('btn__hotels');
btnFiltrerHotels.addEventListener('click', () => {
  const filtreHotels = works.filter(function (work) {
    return work.category.name === 'Hotels & restaurants';
  });
  genererProjets(filtreHotels);
});

// Mode admin

const token = localStorage.getItem('token');

const bandeau = document.querySelector('.bandeau');
const filtersContainer = document.querySelector('.div__filter');
const divProjet = document.querySelector('.projets');
const loginButton = document.querySelector('.login');
const logoutButton = document.querySelector('.logout');
const openModalButton = document.querySelector('.open__modal');

function modeAdmin() {
  if (token) {
    bandeau.classList.remove('hidden');

    filtersContainer.classList.add('hidden');

    loginButton.classList.add('hidden');
    logoutButton.classList.remove('hidden');

    divProjet.style.marginBottom = '90px';

    openModalButton.classList.remove('hidden');
  } else {
    bandeau.classList.add('hidden');

    filtersContainer.classList.remove('hidden');

    loginButton.classList.remove('hidden');
    logoutButton.classList.add('hidden');

    divProjet.style.marginBottom = '50px';

    openModalButton.classList.add('hidden');
  }
}
modeAdmin();

// Deconnexion
logoutButton.addEventListener('click', () => {
  localStorage.removeItem('token');
});

/* MODAL */

/* *** Ajouter à la galerie modal les travaux de l'architecte*/

let projectId;

function genererProjetsModal(works) {
  const modalGallery = document.querySelector('.modal__gallery');
  modalGallery.innerHTML = '';

  for (let i = 0; i < works.length; i++) {
    const modalArticle = works[i];

    const modalProjetElement = document.createElement('figure');
    modalProjetElement.setAttribute('id', modalArticle.id);

    const modalImageElement = document.createElement('img');
    modalImageElement.src = modalArticle.imageUrl;
    modalImageElement.className += 'gallery__image';

    // Trash icon
    const trashIcon = document.createElement('i');
    trashIcon.classList.add('fa-solid', 'fa-trash-can', 'delete__icon');
    const trashButton = document.createElement('button');
    trashButton.classList.add('delete__button');

    // Icon append to Button
    trashButton.appendChild(trashIcon);

    modalGallery.appendChild(modalProjetElement);
    modalProjetElement.appendChild(modalImageElement);

    //Ajouter delete bouton
    modalProjetElement.appendChild(trashButton);

    // Event listener to trash btn
    trashButton.addEventListener('click', async () => {
      // Delete projet

      projectId = modalArticle.id;
      console.log(`Supprimer projet ID: ${projectId}`);

      const token = localStorage.getItem('token');

      if (!token) {
        alert('Vous devez être connecté pour supprimer des projets.');
        return;
      }

      try {
        const response = await fetch(
          `http://localhost:5678/api/works/${projectId}`,
          {
            method: 'DELETE',
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          }
        );

        if (response.ok) {
          console.log(`${projectId} a été supprimé avec succés`);
          // Remove from the works array
          const index = works.findIndex((work) => work.id === projectId);
          works.splice(index, 1);

          // Rafraichir galleries
          genererProjetsModal(works);
          genererProjets(works);
        } else {
          const errorData = await response.json();
          throw new Error(
            errorData.message ||
              "Une erreur s'est produite lors de la suppression"
          );
        }
      } catch (error) {
        console.error(`Erreur supprimer projet: ${error.message}`);
        alert(`Erreur: ${error.message}`);
      }
    });
  }
}
genererProjetsModal(works);

/* *** Ajouter nouvelle image */

// Categorie options

async function categoriesOptions() {
  const response = await fetch('http://localhost:5678/api/categories');
  const categories = await response.json();

  const categorieSelect = document.getElementById('modal__image__categorie');
  categories.forEach((categorie) => {
    const option = document.createElement('option');
    option.value = categorie.id;
    option.innerText = categorie.name;
    option.classList.add('modal__option');

    categorieSelect.appendChild(option);
  });
}

categoriesOptions();

// Form
const projetForm = document.querySelector('.modal__form__upload');
const formError = document.createElement('p');

formError.style.color = 'red';
formError.style.display = 'none';
projetForm.appendChild(formError);

projetForm.addEventListener('submit', async (event) => {
  event.preventDefault();

  const title = document.getElementById('modal__input__title').value.trim();
  const categoryId = document.getElementById('modal__image__categorie').value;

  if (!title || !categoryId || !imageFile) {
    formError.style.display = 'block';
    formError.innerText = 'Tous les champs sont requis !';
    return;
  }

  formError.style.display = 'none';

  const formData = new FormData();
  formData.append('title', title);
  formData.append('category', parseInt(categoryId, 10)); /* Integrer */
  formData.append('image', imageFile);

  console.log('Form data:', formData); /* TEST */

  try {
    const response = await fetch('http://localhost:5678/api/works', {
      method: 'POST',
      body: formData,
      headers: {
        accept: 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    console.log(response);

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Une erreur s'est produite");
    }

    const newProjet = await response.json();
    console.log('Nouveau projet ajouté:', newProjet);

    works.push(newProjet);

    genererProjets(works);
    genererProjetsModal(works);
  } catch (error) {
    formError.style.display = 'block';
    formError.innerText = `Erreur: ${error.message}`;
  }
});

// Preview image

const fileInput = document.getElementById('modal__file__input');
const ajouterPhotoButton = document.querySelector('.modal__ajouter__button');

ajouterPhotoButton.addEventListener('click', (event) => {
  event.preventDefault();
  fileInput.click();
});

fileInput.addEventListener('change', (event) => {
  const file = event.target.files[0];

  if (file) {
    imageFile = file;
    console.log('File selected', file.name);

    const previewImage = document.querySelector('.modal__upload');
    const reader = new FileReader();

    reader.onload = function (e) {
      previewImage.innerHTML = `<img src="${e.target.result}" height= "157px" alt="Image preview" />`;
    };

    reader.readAsDataURL(file);
  }
});
