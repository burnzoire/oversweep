// Manual card media: a one-line summary and a cropped photo for each Manual
// card (#238). The photos reuse public-domain images that the encyclopedia
// already holds and credits, or cards-only ones in public/manual/cards/; the
// credit shows as the photo's hover title.
// `position` moves the crop focus inside the 16:9 frame.
export interface CardMedia {
  summary: string;
  photo: { src: string; alt: string; credit: string; sourceUrl: string; position?: string };
}

export const cardMedia: Record<string, CardMedia> = {
  'module.principles-of-flight': {
    summary: 'How a wing makes lift, and how a jet turns, climbs and stalls.',
    photo: {
      src: 'encyclopedia/aircraft/f-14.jpg',
      alt: 'An F-14D Tomcat in flight with its wings swept forward.',
      credit: 'US Navy, public domain',
      sourceUrl: 'https://commons.wikimedia.org/wiki/File:US_Navy_051105-F-5480T-005_An_F-14D_Tomcat_conducts_a_mission_over_the_Persian_Gulf-region.jpg',
    },
  },
  'module.rotor-wing': {
    summary: 'How a rotor makes lift and how a helicopter is controlled.',
    photo: {
      src: 'encyclopedia/aircraft/ch-47f.jpg',
      alt: 'A CH-47 Chinook in flight with a vehicle slung beneath it.',
      credit: 'Elena Baladelli, US Army, public domain',
      sourceUrl: 'https://commons.wikimedia.org/wiki/File:An_Army_CH-47_Chinook_helicopter_during_a_training_exercise_(210120-A-II094-096M).jpg',
    },
  },
  'module.airfield-basics': {
    summary: 'Read a military airfield and fly its traffic pattern.',
    photo: {
      src: 'encyclopedia/airfields-carriers/whiting-field.jpg',
      alt: 'An aerial view of an air station with crossing runways.',
      credit: 'Julie Ziegenhorn, US Navy, public domain',
      sourceUrl: 'https://commons.wikimedia.org/wiki/File:Aerial_view_of_the_U.S._Naval_Air_Station_Whiting_Field,_Florida_(USA),_on_29_March_2021_(210329-N-QF733-0002).JPG',
    },
  },
  'module.radio-procedures': {
    summary: 'Speak and understand military air–ground radio.',
    photo: {
      src: 'encyclopedia/reference-data/light-gun.jpg',
      alt: 'An airman in a control tower aims a signal light gun.',
      credit: 'Staff Sgt. Bradley C. Church, US Air Force, public domain',
      sourceUrl: 'https://commons.wikimedia.org/wiki/File:An_airman_aims_a_light_gun_as_he_works_in_the_control_tower_at_Ali_Base.jpg',
    },
  },
  'module.air-navigation': {
    summary: 'Fly TACAN and VOR courses and correct for wind.',
    photo: {
      src: 'encyclopedia/airfields-carriers/edwards-2.jpg',
      alt: 'A dry lake bed seen from above, with a compass rose marked on it.',
      credit: 'United States Geological Survey, public domain',
      sourceUrl: 'https://commons.wikimedia.org/wiki/File:Edwards_Air_Force_Base_-_Rogers_Dry_Lake_CA_2006.jpg',
    },
  },
  'module.attitude-instrument-flying': {
    summary: 'Fly the aircraft on instruments alone.',
    photo: {
      src: 'encyclopedia/aircraft/f-15c.jpg',
      alt: 'An F-15C banking above white cloud.',
      credit: 'Airman 1st Class Matthew Seefeldt, US Air Force, public domain',
      sourceUrl: 'https://commons.wikimedia.org/wiki/File:F-15C_Eagle_from_the_44th_Fighter_Squadron_flies_during_a_routine_training_exercise_April_15,_2019.jpg',
    },
  },
  'experience.instrument-trainer': {
    summary: 'Hand-fly an ILS approach to minimums.',
    photo: {
      src: 'encyclopedia/aircraft/c-130j.jpg',
      alt: 'A C-130J flying above cloud.',
      credit: 'US Air Force, public domain',
      sourceUrl: 'https://commons.wikimedia.org/wiki/File:C-130J_135th_AS_Maryland_ANG_in_flight.jpg',
    },
  },
  'module.instrument-procedures': {
    summary: 'Fly a whole sortie in cloud, from departure to the approach.',
    photo: {
      src: 'encyclopedia/aircraft/kc-46.jpg',
      alt: 'A KC-46 flying above cloud.',
      credit: 'US Air Force, public domain',
      sourceUrl: 'https://commons.wikimedia.org/wiki/File:KC-46_Pegasus_prepares_to_refuel_C-17_(cropped).jpg',
    },
  },
  'module.two-ship-formation': {
    summary: 'Fly as a section: parade, route and tactical.',
    photo: {
      src: 'encyclopedia/aircraft/f-15c-2.jpg',
      alt: 'Two F-15Cs flying together above cloud.',
      credit: 'US Air Force, public domain',
      sourceUrl: 'https://commons.wikimedia.org/wiki/File:DF-ST-92-00196_(5375828818).jpg',
    },
  },
  'module.helicopter-formation': {
    summary: 'Fly helicopters together as a flight.',
    photo: {
      src: 'encyclopedia/aircraft/ah-64d-2.jpg',
      alt: 'Four Apache helicopters lifting off in a line.',
      credit: 'Spc. Erin Dierschow, US Army, public domain',
      sourceUrl: 'https://commons.wikimedia.org/wiki/File:Apache_Longbow_DVIDS549015.jpg',
    },
  },
  'module.four-ship-formation': {
    summary: 'Fly a flight of three to five, and display formations.',
    photo: {
      src: 'encyclopedia/aircraft/f-86.jpg',
      alt: 'Three F-86 Sabres flying in formation over mountains.',
      credit: 'US Air Force, public domain',
      sourceUrl: 'https://commons.wikimedia.org/wiki/File:F-86Fs_51FIW_over_Korea_1953.jpg',
    },
  },
  'module.aar-procedures': {
    summary: 'Take fuel from a tanker by boom or probe and drogue.',
    photo: {
      src: 'encyclopedia/aircraft/kc-135.jpg',
      alt: 'A KC-135R tanker refuelling an F-15C through its boom.',
      credit: 'US Air Force, public domain',
      sourceUrl: 'https://commons.wikimedia.org/wiki/File:F-15C_Eagle_from_the_67th_Fighter_Squadron_at_Kadena_AB_is_refueled_by_a_KC-135R_Stratotanker_from_the_909th_Air_Refueling_Squadron_.jpg',
    },
  },
  'module.weapons-delivery': {
    summary: 'How an unguided weapon is delivered onto a target.',
    photo: {
      src: 'encyclopedia/ordnance/mk-84.jpg',
      alt: 'An F-16 banking over a desert range with four bombs falling away below it.',
      credit: 'Tech. Sgt. Jose Lopez, US Air Force, public domain',
      sourceUrl: 'https://commons.wikimedia.org/wiki/File:An_air-to-air_left_rear_view_of_an_F-16_Fighting_Falcon_aircraft_of_the_429th_Tactical_Fighter_Squadron_releasing_four_Mark_84_2000-pound_bombs_over_a_range_in_Nevada_-_DPLA_-_65f08ce9f09ce5ccf7e8231da120fde0.jpeg',
    },
  },
  'module.close-air-support': {
    summary: 'How a close air support attack is controlled and briefed.',
    photo: {
      src: 'encyclopedia/aircraft/a-10.jpg',
      alt: 'An A-10 in flight over desert, carrying bombs and missiles.',
      credit: 'Master Sgt. William Greer, US Air Force, public domain',
      sourceUrl: 'https://commons.wikimedia.org/wiki/File:Fairchild_Republic_A-10_Thunderbolt_II_-_32156159151.jpg',
    },
  },
  'module.precision-targeting': {
    summary: 'How guided weapons are put on a precise point.',
    photo: {
      src: 'encyclopedia/radar-sensors/sniper.jpg',
      alt: 'An F-15E carrying a targeting pod under its intake.',
      credit: 'U.S. Air Force photo, public domain',
      sourceUrl: 'https://commons.wikimedia.org/wiki/File:F-15E_with_Sniper_pod.jpg',
    },
  },
  'module.rotary-wing-attack': {
    summary: 'How attack helicopters attack ground targets.',
    photo: {
      src: 'encyclopedia/aircraft/ah-64d.jpg',
      alt: 'An AH-64D Apache flying low over farmland.',
      credit: 'Tech. Sgt. Andy Dunaway, US Air Force, public domain',
      sourceUrl: 'https://commons.wikimedia.org/wiki/File:AH-64D_Apache_Longbow.jpg',
    },
  },
  'module.sead-dead': {
    summary: 'Suppress and destroy enemy air defenses.',
    photo: {
      src: 'encyclopedia/ordnance/agm-88.jpg',
      alt: 'An AGM-88 HARM under the wing of an F-4G Wild Weasel.',
      credit: 'SSGT. SCOTT STEWART, public domain',
      sourceUrl: 'https://commons.wikimedia.org/wiki/File:AGM-88_HARM_on_F-4G_(cropped).jpg',
    },
  },
  'module.ship-operations': {
    summary: 'Operate aircraft from carriers and amphibious ships.',
    photo: {
      src: 'encyclopedia/aircraft/fa-18c.jpg',
      alt: 'An F/A-18C Hornet on a carrier catapult with deck crew around it.',
      credit: 'Mass Communication Specialist Seaman Kiana A. Raines, US Navy, public domain',
      sourceUrl: 'https://commons.wikimedia.org/wiki/File:FA-18C_of_VFA-34_on_catapult_of_USS_George_Washington_(CVN-73)_in_October_2015.JPG',
    },
  },
  'experience.case-iii-tomcat': {
    summary: 'Fly a Case III carrier recovery from marshal to the deck.',
    photo: {
      src: 'encyclopedia/aircraft/f-14-2.jpg',
      alt: 'The underside of an F-14 banking left.',
      credit: 'PH1 Michael D. Flynn, US Navy, public domain',
      sourceUrl: 'https://commons.wikimedia.org/wiki/File:F-14B_VF-211_Six_Phoenix_4.jpg',
    },
  },
  'module.sortie-planning': {
    summary: 'Plan a sortie from its inputs to the card you fly with.',
    photo: {
      src: 'encyclopedia/airfields-carriers/kadena-2.jpg',
      alt: 'Rows of F-15s lined up on a runway behind a rescue helicopter.',
      credit: 'Senior Airman John Linzmeier, US Air Force, public domain',
      sourceUrl: 'https://commons.wikimedia.org/wiki/File:Elephant_walk_at_Kadena_Air_Base_(2).jpg',
    },
  },
  'module.weather-and-performance': {
    summary: 'Check whether the weather and the aircraft allow the plan.',
    photo: {
      src: 'encyclopedia/aircraft/av-8b.jpg',
      alt: 'A Harrier taking off from a desert runway.',
      credit: 'Senior Airman Giovanni Sims, US Air Force, public domain',
      sourceUrl: 'https://commons.wikimedia.org/wiki/File:AV-8B_Harrier_II_of_VMA-214_launches_from_Prince_Sultan_Air_Base.jpg',
    },
  },
  'module.emergency-procedures': {
    summary: 'Handle an in-flight emergency in any aircraft.',
    photo: {
      src: 'manual/cards/ejection.jpg',
      alt: 'A pilot ejecting from an F-16 moments before it hits the ground, the canopy tumbling above the seat.',
      credit: 'Staff Sgt. Bennie J. Davis III, US Air Force, public domain',
      sourceUrl: 'https://commons.wikimedia.org/wiki/File:2003_Thunderbirds_Mountain_Home_airshow_crash_ejection.jpg',
      position: '50% 42%',
    },
  },
  'experience.autorotation': {
    summary: 'Land a helicopter after an engine failure.',
    photo: {
      src: 'encyclopedia/aircraft/oh-58d-2.jpg',
      alt: 'A small OH-58D helicopter flying low.',
      credit: 'US Army, public domain',
      sourceUrl: 'https://commons.wikimedia.org/wiki/File:OH-58D_1st_Squadron,_17th_Cavalry_Regiment_(cropped).jpg',
    },
  },
  'module.bfm': {
    summary: 'Turn with an opponent and win the fight within visual range.',
    photo: {
      src: 'encyclopedia/aircraft/mig-15-3.jpg',
      alt: 'A gun-camera frame of a MiG-15 seen from behind.',
      credit: 'US Air Force, public domain',
      sourceUrl: 'https://commons.wikimedia.org/wiki/File:MiG-15_being_hit_over_Korea_c1953.jpg',
    },
  },
  'module.bvr-intercepts': {
    summary: 'Fly the fight before the merge.',
    photo: {
      src: 'encyclopedia/ordnance/aim-7.jpg',
      alt: 'A missile leaving an F/A-18C, seen from behind the pilot.',
      credit: 'Courtesy Photo, public domain',
      sourceUrl: 'https://commons.wikimedia.org/wiki/File:U.S._Marine_Corps_Capt._Christopher_Prout_with_Marine_Fighter_Attack_Squadron_(VMFA)_232,_Marine_Aircraft_Group_11,_3rd_Marine_Aircraft_Wing_shoots_a_AIM-7_Sparrow_missile_from_a_F-A-18C_Hornet_airplane_while_130516-M-CP123-001.jpg',
    },
  },
  'module.radar-and-warning': {
    summary: 'How radar searches and locks, and how warning receivers and countermeasures answer it.',
    photo: {
      src: 'encyclopedia/radar-sensors/ale-47.jpg',
      alt: 'A Hornet climbing away as flares fall behind it.',
      credit: 'Mass Communication Specialist 2nd Class James R. Evans, US Navy, public domain',
      sourceUrl: 'https://commons.wikimedia.org/wiki/File:US_Navy_110603-N-DR144-202_An_F-A-18C_Hornet_deploys_flares_while_flying_faster_than_the_speed_of_sound_alongside_USS_Carl_Vinson_(CVN_70)_during_a.jpg',
    },
  },
  'module.situational-awareness': {
    summary: 'Build and keep the picture from your sensors and the controller.',
    photo: {
      src: 'encyclopedia/terminology/brevity.jpg',
      alt: 'Airmen in headsets at consoles inside an AWACS aircraft.',
      credit: 'Senior Airman Matthew Bruch, US Air Force, public domain',
      sourceUrl: 'https://commons.wikimedia.org/wiki/File:Airstrikes_in_Syria_141002-F-UL677-288.jpg',
    },
  },
};
