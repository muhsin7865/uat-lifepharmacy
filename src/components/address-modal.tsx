import ModalContainer from "./ui/modal-container";
import React, { useEffect, useRef, useState } from "react";
import { RadioGroup } from "@headlessui/react";
import { useSession } from "next-auth/react";
import { useModal } from "./ui/modalcontext";
import { Typography } from "./ui/typography";
import { Button } from "./ui/button";
import { Icon } from "./ui/icons";
import { useForm } from "react-hook-form";
import { AddNewAddressForm } from "./addnewAddressForm";
import { RadioContainer, RadioItem } from "./ui/skeleton";
import { Map as Maps } from "lucide-react";
import Map from "./map";
import { Input } from "./ui/input";
import { OpenStreetMapProvider } from "leaflet-geosearch";

const AddressModal = () => {
  const [locationMapVisibility, setLocationMapVisbility] = useState(false);
  const [searchData, setSearchData] = useState<any>(null);
  const [selectedLocation, setSelectedLocation] = useState<any>(null);
  const provider = new OpenStreetMapProvider();
  console.log(searchData);

  const getSearchData = (query: string) => {
    provider.search({ query: query }).then((res) => setSearchData(res));
  };

  const { data: session } = useSession();
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
  } = useModal();

  function setCloseModal() {
    setaddNewAddress(false);
    setaddnewAddressFormVisibility(false);
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
    fetch("https://ipwho.is/")
      .then((res) => res.json())
      .then((res) => setCurrentLocation([res.latitude, res.longitude]));
  };

  const [currentLocation, setCurrentLocation] = useState([
    25.192622, 55.276383,
  ]);

  console.log(currentLocation);

  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCurrentLocation([
            position.coords.latitude,
            position.coords.longitude,
          ]);
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
  console.log(addNewAddressClick);

  return (
    <ModalContainer
      size={"lg"}
      showModal={session && addNewAddress && addressData ? true : false}
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
          handleSubmit={handleSubmit}
          register={register}
          errors={errors}
          currentLocation={currentLocation}
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
                  onClick={(e) =>
                    getSearchData((e.target as HTMLInputElement).value)
                  }
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
                      onClick={()=>
                      {
                        setValue("name", "");
                        setValue("phone", "");
                        setValue("type", "");
                        setValue("state", selectedLocation.name);
                        setValue("city", selectedLocation.name);
                        setValue("street_address", selectedLocation.display_name);
                        setValue("flat_number", "");
                        setValue("building", "");
                        setValue("country", selectedLocation.name);
                        setValue("additional_info", "");
                        setavailableAddresses(false);
                        setLocationMapVisbility(false)
                        setaddnewAddressFormVisibility(true);
                      }
                      }
                    >
                      Confirm
                    </Button>
                  }
                  onChange={(e) => {
                    getSearchData((e.target as HTMLInputElement).value);
                  }}
                />
                {searchData && searchData.length > 0 && (
                  <div className="relative ">
                    <div className="absolute left-0 right-0 bg-white border border-muted rounded-lg rounded-t-none  w-full">
                      {searchData.map((sd: any, indx: number) => (
                        <button
                          onClick={() => {
                            setSelectedLocation(sd.raw)
                            setCurrentLocation([sd.raw.lat, sd.raw.lon]);
                            setSearchData(null);
                          }}
                          className={`flex space-x-2 p-2 items-center hover:bg-slate-100 w-full ${
                            searchData.length - 1 === indx
                              ? " "
                              : "border-b border-muted"
                          }`}
                        >
                          <Icon
                            type="locationPinIcon"
                            sizes={"sm"}
                            className="text-slate-500"
                          />
                          <Typography variant={"paragraph"} size={"sm"}>
                            {sd.raw.display_name}
                          </Typography>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <Map width="800" height="400" center={currentLocation} zoom={12}>
            {({
              TileLayer,
              Marker,
              Popup,
            }: {
              TileLayer: any;
              Marker: any;
              Popup: any;
            }) => (
              <>
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                />
                <Marker position={currentLocation}>
                  <Popup>
                    A pretty CSS3 popup. <br /> Easily customizable.
                  </Popup>
                </Marker>
              </>
            )}
          </Map>
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
                      <div className="flex w-full  justify-between">
                        <div className="flex items-center">
                          <div className="text-sm flex space-x-7 rtl:space-x-reverse">
                            <RadioGroup.Description
                              as="span"
                              className={`inline ${checked ? "" : ""}`}
                            >
                              <div className="flex space-x-3 rtl:space-x-reverse items-start">
                                <RadioContainer className={""}>
                                  <RadioItem
                                    checked={checked}
                                    value={AddressDataIndex}
                                  />
                                </RadioContainer>
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
                        {
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
                              setValue("street_address", addr.street_address);
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
                        }
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
                setaddNewAddress(false);
                setaddnewAddressFormVisibility(false);
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
