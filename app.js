// Инициализация карты
// Создание карты
const map = new ol.Map({
  target: 'map',
  layers: [
    new ol.layer.Tile({
      source: new ol.source.OSM()
    }),
    new ol.layer.Tile({
      source: new ol.source.TileWMS({
        url: 'http://localhost:8080/geoserver/Borders/wms',
        params: {
          'LAYERS': 'Borders:Borders',
          'VERSION': '1.3.0',
          'CRS': 'EPSG:32643'  // Указываем UTM 43N
        },
        serverType: 'geoserver'
      })
    })
  ],
  view: new ol.View({
    projection: 'EPSG:32643',  // Используем UTM 43N
    center: [500000, 7300000], // Пример: координаты в UTM (ЯНАО)
    zoom: 5
  })
});

// 1. WMS слой с вашего геосервера
const wmsLayer = new ol.layer.Tile({
    title: 'WMS слой',
    type: 'base',
    visible: false,
    source: new ol.source.TileWMS({
        url: 'http://ваш_геосервер/geoserver/ows', // Замените на URL вашего GeoServer
        params: {
            'LAYERS': 'название_рабочего_пространства:название_слоя', // Например, 'topp:states'
            'TILED': true,
            'VERSION': '1.1.1'
        },
        serverType: 'geoserver'
    })
});

// 2. TMS слой OSM (OpenStreetMap)
const osmLayer = new ol.layer.Tile({
    title: 'OpenStreetMap',
    type: 'base',
    visible: true,
    source: new ol.source.OSM()
});

// 3. TMS слой ESRI
const esriLayer = new ol.layer.Tile({
    title: 'ESRI World Imagery',
    type: 'base',
    visible: false,
    source: new ol.source.XYZ({
        url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        attributions: 'Tiles © <a href="https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer">ArcGIS</a>'
    })
});

// Добавление всех слоев на карту
map.addLayer(osmLayer);
map.addLayer(esriLayer);
map.addLayer(wmsLayer);

// Элементы управления
const mousePositionControl = new ol.control.MousePosition({
    coordinateFormat: ol.coordinate.createStringXY(4),
    projection: 'EPSG:4326',
    className: 'custom-mouse-position',
    target: document.getElementById('mouse-position'),
    undefinedHTML: '&nbsp;'
});
map.addControl(mousePositionControl);

const scaleLineControl = new ol.control.ScaleLine({
    target: document.getElementById('scale-line')
});
map.addControl(scaleLineControl);

// Управление слоями
function updateLayerSwitcher() {
    const layerList = document.getElementById('layer-list');
    layerList.innerHTML = '';
    
    map.getLayers().forEach(layer => {
        if (layer.get('title')) {
            const li = document.createElement('div');
            const label = document.createElement('label');
            const checkbox = document.createElement('input');
            
            checkbox.type = layer.get('type') === 'base' ? 'radio' : 'checkbox';
            checkbox.name = layer.get('type') === 'base' ? 'baseLayer' : 'overlayLayer';
            checkbox.checked = layer.getVisible();
            checkbox.onchange = (e) => {
                if (layer.get('type') === 'base') {
                    // Для базовых слоев скрываем все, затем показываем выбранный
                    map.getLayers().forEach(l => {
                        if (l.get('type') === 'base') l.setVisible(false);
                    });
                }
                layer.setVisible(e.target.checked);
            };
            
            label.appendChild(checkbox);
            label.appendChild(document.createTextNode(' ' + layer.get('title')));
            li.appendChild(label);
            layerList.appendChild(li);
        }
    });
}

// Инициализация переключателя слоев
updateLayerSwitcher();
