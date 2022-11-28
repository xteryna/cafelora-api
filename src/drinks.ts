import { fail, Results, success } from "./nanorest.js";
import { User } from "./users.js";

export type Layer = (
  | 'espresso'
  | 'water'
  | 'milk'
  | 'milk_foam'
  | 'liquor'
  | 'whipped_cream'
  | 'lemon'
  | 'steamed_milk'
  | 'chocolate'
  | 'ice_cream'
  | 'half_and_half'
  | 'cream'
  | 'vanilla_sugar'
  | 'honey'
);

export interface Product {
  id: string,
  name: string,
  layers: Layer[],
};

export interface LayerDetail {
  color: string,
  label: string,
}

export type Layers = { [L in Layer]: LayerDetail };

const products: Product[] = [
  { id: 'espresso', name: 'Espresso', layers: ['espresso'] },
  { id: 'doppio', name: 'Doppio', layers: ['espresso'] },
  { id: 'lungo', name: 'Lungo', layers: ['water', 'espresso'] },
  { id: 'ristretto', name: 'Ristretto', layers: ['espresso'] },
  { id: 'macchiato', name: 'Macchiato', layers: ['milk_foam', 'espresso'] },
  { id: 'corretto', name: 'Corretto', layers: ['liquor', 'espresso'] },
  { id: 'con-panna', name: 'Con panna', layers: ['whipped_cream', 'espresso'] },
  { id: 'romano', name: 'Romano', layers: ['lemon', 'espresso'] },
  { id: 'cappuccino', name: 'Cappuccino', layers: ['milk_foam', 'steamed_milk', 'espresso'] },
  { id: 'americano', name: 'Americano', layers: ['water', 'espresso'] },
  { id: 'cafe-late', name: 'Café late', layers: ['milk_foam', 'steamed_milk', 'espresso'] },
  { id: 'flat-white', name: 'Flat white', layers: ['steamed_milk', 'espresso'] },
  { id: 'marocchino', name: 'Marocchino', layers: ['milk_foam', 'chocolate', 'espresso'] },
  {
    id: 'mocha',
    name: 'Mocha',
    layers: ['milk_foam', 'steamed_milk', 'chocolate', 'espresso']
  },
  {
    id: 'bicerin',
    name: 'Bicerin', 
    layers: ['whipped_cream', 'steamed_milk', 'chocolate', 'espresso']
  },
  { id: 'breve', name: 'Breve', layers: ['milk_foam', 'half_and_half', 'espresso'] },
  { id: 'raf-coffee', name: 'Raf coffee', layers: ['cream', 'vanilla_sugar', 'espresso'] },
  { id: 'mead-raf', name: 'Mead rad',  layers: ['cream', 'honey', 'espresso'] },
  { id: 'vienna-coffee', name: 'Vídeňská káva', layers: ['whipped_cream', 'espresso'] },
  { id: 'chocolate-milk', name: 'Čokoláda s mlékem', layers: ['milk', 'chocolate'] }
]

const allLayers: Layers = {
  'espresso': {
    color: '#613916',
    label: 'espresso'
  },
  'water': {
    color: '#b0dee1',
    label: 'voda'
  },
  'milk': {
    color: '#fed7b0',
    label: 'mléko'
  },
  'milk_foam': {
    color: '#feeeca',
    label: 'mléčná pěna'
  },
  'liquor': {
    color: '#fa872f',
    label: 'likér'
  },
  'whipped_cream': {
    color: '#feeeca',
    label: 'šlehačka'
  },
  'lemon': {
    color: '#fbdf5b',
    label: 'citrón'
  },
  'steamed_milk': {
    color: '#fed7b0',
    label: 'teplé mléko'
  },
  'chocolate': {
    color: '#391d07',
    label: 'čokoláda'
  },
  'ice_cream': {
    color: '#feeeca',
    label: 'zrzlina'
  },
  'half_and_half': {
    color: '#fed7b1',
    label: 'mléko se smetanou'
  },
  'cream': {
    color: '#fdeeca',
    label: 'smetana'
  },
  'vanilla_sugar': {
    color: '#ffb981',
    label: 'vanilkový cukr'
  },
  'honey': {
    color: '#ffb603',
    label: 'med'
  },
};

export interface Drink {
  id: string,
  name: string,
  ordered: boolean,
  layers: LayerDetail[],
  image: string,
}

export const createDrinks = (appUrl: string): Drink[] => (
  products.map(({ id, name, layers }) => ({
    id, 
    name, 
    ordered: false,
    layers: layers.map((layerId) => allLayers[layerId]),
    image: `${appUrl}/assets/cups/${id}.png`,
  }))
);

export const getUserDrinks = (drinks: Drink[], user: User): Drink[] => drinks.map(
  (drink) => ({ ...drink, ordered: user.orders.includes(drink.id)})
);

export const findUserDrink = (
  drinks: Drink[], id: string, user: User,
): Results<Drink, 'not-found'> => {
  const drink = drinks.find((drink) => drink.id === id);
  if (drink === undefined) {
    return fail('not-found');
  }

  return success({
    ...drink,
    ordered: user.orders.includes(id),
  });
}
