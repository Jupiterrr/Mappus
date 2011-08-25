var map_style = [
{
    featureType: "water",
    elementType: "all",
    stylers: [
    {
        gamma: 1.08
    },
    {
        lightness: 22
    },
    {
        saturation: 56
    }
    ]
},
{
    featureType: "poi.park",
    elementType: "all",
    stylers: [
    {
        gamma: 0.98
    },
    {
        lightness: 28
    },
    {
        saturation: 3
    }
    ]
},
{
    featureType: "road.highway",
    elementType: "geometry",
    stylers: [
    {
        hue: "#ff001a"
    },
    {
        visibility: "simplified"
    },
    {
        saturation: -21
    },
    {
        lightness: 62
    }
    ]
},
{
    featureType: "road.arterial",
    elementType: "all",
    stylers: [
    {
        hue: "#eeff00"
    },
    {
        gamma: 1.17
    },
    {
        saturation: -29
    },
    {
        lightness: 46
    }
    ]
},
{
    featureType: "administrative.country",
    elementType: "geometry",
    stylers: [
    {
        lightness: 20
    },
    {
        saturation: -44
    }
    ]
},
{
    featureType: "all",
    elementType: "labels",
    stylers: [
    {
        saturation: -40
    },
    {
        lightness: 40
    }
    ]
},
{
    featureType: "water",
    elementType: "labels",
    stylers: [

    ]
}
];






var map_style2 = [
{
    featureType: "water",
    elementType: "all",
    stylers: [
          { visibility: "simplified" },
          { hue: "#5F9DAE" }
        ]
},
{
     featureType: "landscape",
     stylers: [
       { visibility: "simplified" }
     ]
   }];
  
  var map_style3 = [
  {
      featureType: "all",
      stylers: [
            { visibility: "off" }
          ]
  },
  {
      featureType: "water",
      elementType: "all",
      stylers: [
            { visibility: "simplified" },
            { hue: "#5F9DAE" }
          ]
  },
  {
      featureType: "landscape",
      stylers: [
        { saturation: 21 },
        { lightness: 16 },
        { visibility: "simplified" },
        { gamma: 0.05 },
        { hue: "#604F46" }
      ]
    }];