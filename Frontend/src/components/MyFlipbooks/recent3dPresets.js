import sportsBikeImg from '../../assets/3d_samples/sports_bike.png';
import centrifugalPumpImg from '../../assets/3d_samples/centrifugal_pump.png';
import electricMotorImg from '../../assets/3d_samples/electric_motor.png';
import modernChairImg from '../../assets/3d_samples/modern_chair.png';
import villaModelImg from '../../assets/3d_samples/villa_model.png';

export const RECENT_3D_PRESETS = [
  {
    id: 'preset_sports_bike',
    name: 'Sports Bike',
    title: 'Sports Bike',
    format: 'GLB',
    size: '24.5 MB',
    category: 'Vehicles',
    categoryColor: 'bg-rose-50 text-rose-600 border-rose-200',
    image: sportsBikeImg,
    modelUrl: '/chair.glb'
  },
  {
    id: 'preset_centrifugal_pump',
    name: 'Centrifugal Pump',
    title: 'Centrifugal Pump',
    format: 'GLTF',
    size: '12.8 MB',
    category: 'Pumps',
    categoryColor: 'bg-sky-50 text-sky-600 border-sky-200',
    image: centrifugalPumpImg,
    modelUrl: '/chair.glb'
  },
  {
    id: 'preset_electric_motor',
    name: 'Electric Motor',
    title: 'Electric Motor',
    format: 'OBJ',
    size: '8.4 MB',
    category: 'Motors',
    categoryColor: 'bg-amber-50 text-amber-600 border-amber-200',
    image: electricMotorImg,
    modelUrl: '/chair.glb'
  },
  {
    id: 'preset_modern_chair',
    name: 'Modern Chair',
    title: 'Modern Chair',
    format: 'GLB',
    size: '5.2 MB',
    category: 'Furniture',
    categoryColor: 'bg-purple-50 text-purple-600 border-purple-200',
    image: modernChairImg,
    modelUrl: '/chair.glb'
  },
  {
    id: 'preset_villa_model',
    name: 'Villa Model',
    title: 'Villa Model',
    format: 'FBX',
    size: '36.1 MB',
    category: 'Architecture',
    categoryColor: 'bg-cyan-50 text-cyan-600 border-cyan-200',
    image: villaModelImg,
    modelUrl: '/chair.glb'
  }
];

