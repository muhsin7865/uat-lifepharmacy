import ModalContainer from "./ui/modal-container";
import React, { useEffect, useRef, useState } from "react";
import { RadioGroup } from "@headlessui/react";
import { RadioGroup as RadixRadioGroup } from "./ui/radio";
import { useModal } from "./ui/modalcontext";
import { Typography } from "./ui/typography";
import { Button } from "./ui/button";
import { Icon } from "./ui/icons";
import { useForm } from "react-hook-form";
import { AddNewAddressForm } from "./addnewAddressForm";
import { Map as Maps, Navigation } from "lucide-react";
import Map from "./map";
import { Input } from "./ui/input";
import { useMap, useMapEvents } from "react-leaflet";
import Image from "next/image";
import { RadioGroupItem } from "./ui/radio";
import { useSession } from "next-auth/react";

const AddressModal = () => {
  const [locationMapVisibility, setLocationMapVisbility] = useState(false);
  const [searchData, setSearchData] = useState<any>(null);
  const [selectedLocation, setSelectedLocation] = useState<any>(null);
  const [searchBoxQuery, setSearchBoxQuery] = useState<any>(null);
  const [searchTimer, setSearchTimer] = useState<any>(null);
  const { update } = useSession();

  const getSearchData = (query: string) => {
    setSearchBoxQuery(query);

    clearTimeout(searchTimer);

    const timer = setTimeout(() => {
      fetch(
        `https://api.geoapify.com/v1/geocode/search?text=${query}&filter=place:51a334400eefff4a4059fedc2b4e10003840f00101f90133b2040000000000c0020b&apiKey=6be0270757d44683a5052459cb91349c`
      )
        .then((res) => res.json())
        .then((res) => setSearchData(res));
    }, 300);

    setSearchTimer(timer);
  };

  const {
    setaddNewAddress,
    addNewAddress,
    setAddressDataIndex,
    AddressDataIndex,
    availableAddresses,
    setavailableAddresses,
    setaddnewAddressFormVisibility,
    addnewAddressFormVisibility,
    addressData,
    locationOnClickHandle,
    addNewAddressClick,
    setAddNewAddressClick,
    currentLocation,
    setCurrentLocation,
  } = useModal();

  function setCloseModal() {
    setaddNewAddress(false);
    setTimeout(() => {
      setaddnewAddressFormVisibility(false);
      setLocationMapVisbility(false);
    }, 200);
  }

  const {
    handleSubmit,
    register,
    getValues,
    setValue,
    formState: { isValid, errors },
  } = useForm({
    mode: "onChange",
  });

  const getLocationByIp = () => {
    try {
      fetch("https://ipwho.is/")
        .then((res) => res.json())
        .then((res) => {
          setCurrentCordinates(res.latitude, res.longitude);
        });
    } catch (err) {
      setCurrentCordinates(25.192622, 55.276383);
    }
  };

  const [focusLocation, setCurrentLocationFocus] = useState(true);

  const setCurrentCordinates = (lat: number, lng: number) => {
    setCurrentLocation([lat, lng]);

    getReverseGeoCodingApiData(lat, lng);
  };

  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCurrentCordinates(
            position.coords.latitude,
            position.coords.longitude
          );
        },
        (error) => {
          getLocationByIp();
        }
      );
    }
  }, []);

  const inputRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event: any) => {
      //@ts-ignore
      if (inputRef.current && !inputRef.current.contains(event.target)) {
        setSearchData(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function ChangeView() {
    const map = useMap();

    useMapEvents({
      dragend: (e: any) => {
        debugger;
        setCurrentLocationFocus(false);
        getReverseGeoCodingApiData(
          e.target.getCenter().lat,
          e.target.getCenter().lng
        );
        map.setView([e.target.getCenter().lat, e.target.getCenter().lng], 50);
      },
    });

    return null;
  }

  function CenterView() {
    console.log("invoked");

    const map = useMap();
    map.setView(currentLocation, 50);
    return null;
  }

  const getReverseGeoCodingApiData = (
    lat: string | number,
    lng: string | number
  ) => {
    fetch(
      `https://api.geoapify.com/v1/geocode/reverse?lat=${lat}&lon=${lng}&apiKey=6be0270757d44683a5052459cb91349c`
    )
      .then((res) => res.json())
      .then((res) => {
        setSearchBoxQuery(res.features[0].properties.formatted);
        setSelectedLocation(res.features[0].properties);
      });
  };

  return (
    <ModalContainer
      size={"xl"}
      showModal={addNewAddress && addressData ? true : false}
      setCloseModal={setCloseModal}
    >
      {addNewAddressClick && addressData && addressData.length === 0 ? (
        <div className=" bg-white rounded-lg   overflow-y-auto no-scrollbar min-h-fit  max-h-[calc(80vh-1rem)] ">
          <div className="space-y-6">
            <Maps className="w-20 h-20" />
            <div className="py-5">
              <Typography bold={"bold"} size={"xl"}>
                You have no saved Addresses
              </Typography>
              <p className="text-gray-400 text-sm py-1">
                Start by adding a new address
              </p>
            </div>
          </div>
          <div className="flex items-center rtl:space-x-reverse space-x-2 border-t border-gray-200 rounded-b  sticky bottom-0">
            <Button
              type="button"
              className="w-full"
              onClick={() => {
                setAddNewAddressClick(false);
                setLocationMapVisbility(true);
              }}
            >
              ADD NEW ADDRESS
            </Button>
          </div>
        </div>
      ) : null}
      {addnewAddressFormVisibility ? (
        <AddNewAddressForm
          isModal={true}
          setCloseModal={setCloseModal}
          getValues={getValues}
          setLocationMapVisbility={setLocationMapVisbility}
          handleSubmit={handleSubmit}
          register={register}
          errors={errors}
          currentLocation={currentLocation}
          setaddnewAddressFormVisibility={setaddnewAddressFormVisibility}
        />
      ) : null}

      {locationMapVisibility && (
        <div className="space-y-3">
          <div className="pb-3">
            <div className="flex justify-between items-center pb-3">
              <div className=" flex space-x-3 items-center">
                <button
                  onClick={() => {
                    locationOnClickHandle();
                    setLocationMapVisbility(false);
                  }}
                >
                  <Icon type="chevronLeftIcon" className="text-slate-700" />
                </button>
                <Typography bold={"semibold"} variant={"lifeText"}>
                  Enter Location
                </Typography>
              </div>
              <button onClick={() => setCloseModal()}>
                <Icon type="crossIcon" className="text-slate-700" />
              </button>
            </div>
            <div className="w-full relative z-[10000] " ref={inputRef}>
              <div className="w-full">
                <Input
                  iconRight={
                    <button onClick={() => setSearchBoxQuery("")}>
                      <Icon
                        sizes={"sm"}
                        className="text-slate-500"
                        type="crossIcon"
                        variant={"inputIconRight"}
                      />
                    </button>
                  }
                  onClick={(e) =>
                    getSearchData((e.target as HTMLInputElement).value)
                  }
                  value={searchBoxQuery}
                  iconLeft={
                    <Icon
                      sizes={"sm"}
                      className="text-slate-500"
                      type="searchIcon"
                      variant={"inputIconLeft"}
                    />
                  }
                  className="w-full"
                  sizes={"sm"}
                  rounded={"sm"}
                  buttonRight={
                    <Button
                      size={"sm"}
                      rounded={"sm"}
                      position={"inputRightBtn"}
                      onClick={() => {
                        setValue("name", "");
                        setValue("phone", "");
                        setValue("type", "");
                        setValue("state", selectedLocation.state);
                        setValue("city", selectedLocation.city);
                        setValue(
                          "google_address",
                          selectedLocation.address_line1
                        );
                        setValue("flat_number", "");
                        setValue("building", "");
                        setValue("country", selectedLocation.country);
                        setValue("additional_info", "");
                        setavailableAddresses(false);
                        setLocationMapVisbility(false);
                        setaddnewAddressFormVisibility(true);
                        // setCurrentLocationFocus(true)
                      }}
                    >
                      Confirm
                    </Button>
                  }
                  onChange={(e) => {
                    getSearchData((e.target as HTMLInputElement).value);
                  }}
                />
                {searchData &&
                  searchData.features &&
                  searchData.features.length > 0 && (
                    <div className="relative ">
                      <div className="absolute left-0 right-0 bg-white border border-muted rounded-lg rounded-t-none  w-full">
                        {searchData.features.map((sd: any, indx: number) => (
                          <button
                            onClick={() => {
                              setCurrentLocationFocus(true);
                              setSelectedLocation(sd.properties);
                              setCurrentLocation([
                                sd.geometry.coordinates[1],
                                sd.geometry.coordinates[0],
                              ]);
                              setSearchData(null);
                              setSearchBoxQuery(sd.properties.formatted);
                            }}
                            className={`flex space-x-2 p-2 items-center hover:bg-slate-100 w-full ${
                              searchData.length - 1 === indx
                                ? " "
                                : "border-b border-muted"
                            }`}
                          >
                            <div>
                              <Icon
                                type="locationPinIcon"
                                sizes={"sm"}
                                className="text-slate-500"
                              />
                            </div>

                            <Typography
                              variant={"paragraph"}
                              size={"sm"}
                              lineClamp={"one"}
                            >
                              {sd.properties.formatted}
                            </Typography>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
              </div>
            </div>
          </div>
          <div className="relative">
            <Map width="800" height="400" center={currentLocation} zoom={50}>
              {({ TileLayer, Marker }: { TileLayer: any; Marker: any }) => (
                <>
                  {focusLocation && <CenterView />}
                  <ChangeView />

                  <TileLayer url="https://maps.geoapify.com/v1/tile/klokantech-basic/{z}/{x}/{y}.png?apiKey=6be0270757d44683a5052459cb91349c" />

                  <Image
                    src="/images/location-selector.png"
                    alt="location-pin"
                    className="z-[100000] absolute inset-0 m-auto"
                    width={50}
                    height={50}
                  />

                  <button
                    className="z-[100000] absolute right-5 bottom-5 bg-white backdrop-blur-sm rounded-full  shadow-md p-3 cursor-pointer"
                    onClick={() => setCurrentLocationFocus(true)}
                  >
                    <Navigation
                      className={`w-5 h-5 m-auto text-blue-500 ${
                        focusLocation ? "fill-blue-500" : ""
                      }`}
                    />
                  </button>
                </>
              )}
            </Map>
          </div>
        </div>
      )}

      {addressData && addressData.length > 0 && availableAddresses ? (
        <div className=" overflow-y-auto overflow-x-hidden  no-scrollbar  min-h-fit  max-h-[calc(80vh-1rem)]">
          <div className="w-full flex justify-between pb-2 items-center">
            <div className="flex space-x-2 rtl:space-x-reverse items-center">
              <Icon type="locationPinIcon" />
              <Typography size={"lg"} bold={"bold"} variant={"lifeText"}>
                Addresses
              </Typography>
            </div>

            <Button
              size={"sm"}
              onClick={() => {
                setavailableAddresses(false);
                setLocationMapVisbility(true);
                // setaddnewAddressFormVisibility(true);
              }}
            >
              Add New Address
            </Button>
          </div>
          <RadioGroup value={AddressDataIndex} onChange={setAddressDataIndex}>
            <div className="rounded-lg p-3 bg-slate-50 border-2 border-muted">
              <div className="rounded-full p-1 px-2 bg-violet-100">
                <Typography size={"xs"} bold={"bold"}>
                  AVAILABLE ADDRESSES
                </Typography>
              </div>
              {addressData.map((addr: any, indx: number) => (
                <RadioGroup.Option
                  key={addr.id}
                  value={addr}
                  className={({ active, checked }) =>
                    ` ${active ? "" : ""}
                  ${checked ? " bg-opacity-75 " : "bg-slate-50"}
                    relative flex cursor-pointer p-2 ${
                      indx != addressData.length - 1
                        ? " border-muted border-b-2 focus:outline-none"
                        : ""
                    }`
                  }
                >
                  {({ active, checked }) => (
                    <>
                      <div className="flex w-full justify-between">
                        <div className="flex items-center">
                          <div className="text-sm flex space-x-7 rtl:space-x-reverse">
                            <RadioGroup.Description
                              as="span"
                              className={`inline ${checked ? "" : ""}`}
                            >
                              <div className="flex space-x-3 rtl:space-x-reverse items-start">
                                <RadixRadioGroup className={""}>
                                  <RadioGroupItem
                                    checked={checked}
                                    value={AddressDataIndex}
                                  />
                                </RadixRadioGroup>
                                <table className="table-auto">
                                  <tbody>
                                    <tr>
                                      <td className="table-data ">
                                        <Typography size={"xs"}>
                                          NAME
                                        </Typography>
                                      </td>
                                      <td className="table-data">
                                        <Typography
                                          size={"xs"}
                                          bold={"semibold"}
                                        >
                                          {" "}
                                          {addr.name}
                                        </Typography>
                                      </td>
                                    </tr>
                                    <tr>
                                      <td className="table-data">
                                        <Typography size={"xs"}>
                                          ADDRESS
                                        </Typography>
                                      </td>
                                      <td className="table-data">
                                        <Typography
                                          size={"xs"}
                                          bold={"semibold"}
                                          lineClamp={"one"}
                                        >
                                          {" "}
                                          {addr.google_address}
                                        </Typography>
                                      </td>
                                    </tr>
                                    <tr>
                                      <td className="table-data">
                                        <Typography size={"xs"}>
                                          PHONE
                                        </Typography>
                                      </td>
                                      <td className="table-data">
                                        <Typography
                                          size={"xs"}
                                          bold={"semibold"}
                                        >
                                          {" "}
                                          {addr.phone}
                                        </Typography>
                                      </td>
                                    </tr>
                                  </tbody>
                                </table>
                              </div>
                            </RadioGroup.Description>
                          </div>
                        </div>

                        <Button
                          variant={"closeBtn"}
                          size={"sm"}
                          className="shrink-0 text-life cursor-pointer p-0"
                          onClick={() => {
                            setValue("name", addr.name);
                            setValue("phone", addr.phone);
                            setValue("type", addr.type);
                            setValue("state", addr.state);
                            setValue("city", addr.city);
                            setValue("google_address", addr.google_address);
                            setValue("flat_number", addr.flat_number);
                            setValue("building", addr.building);
                            setValue("country", addr.country);
                            setValue("additional_info", addr.additional_info);
                            setavailableAddresses(false);
                            setaddnewAddressFormVisibility(true);
                          }}
                        >
                          <Icon type="editIcon" sizes={"xs"} />
                        </Button>
                      </div>
                    </>
                  )}
                </RadioGroup.Option>
              ))}
            </div>
          </RadioGroup>

          <div className="w-full bg-white pt-3 sticky bottom-0">
            <Button
              className="w-full"
              size={"sm"}
              onClick={() => {
                debugger;
                setaddNewAddress(false);
                setaddnewAddressFormVisibility(false);
                update({ selected_address: AddressDataIndex });
              }}
            >
              CONFIRM ADDRESS
            </Button>
          </div>
        </div>
      ) : null}
    </ModalContainer>
  );
};

export default AddressModal;
