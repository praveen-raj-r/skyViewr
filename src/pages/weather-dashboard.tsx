import { AlertComponentProps } from "@/api/types";
import CurrentWeather from "@/components/current-weather";
import { HourlyTemperature } from "@/components/hourly-temprature";
import WeatherSkeleton from "@/components/loading-skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { WeatherDetails } from "@/components/weather-details";
import { WeatherForecast } from "@/components/weather-forecast";
import { useGeolocation } from "@/hooks/use-geolocation";
import {
  useForecastQuery,
  useReverseGeocodeQuery,
  useWeatherQuery,
} from "@/hooks/use-weather";
import { AlertTriangle, MapPin, RefreshCw } from "lucide-react";

function WeatherDashboard() {
  const {
    coordinates,
    error: locationError,
    isLoading: locationLoading,
    getLocation,
  } = useGeolocation();

  const weatherQuery = useWeatherQuery(coordinates);
  const forecastQuery = useForecastQuery(coordinates);
  const locationQuery = useReverseGeocodeQuery(coordinates);

  const handleRefresh = () => {
    getLocation();
    if (coordinates) {
      //reload weather data
      weatherQuery.refetch();
      forecastQuery.refetch();
      locationQuery.refetch();
    }
  };

  if (!coordinates) {
    return (
      <AlertComponent
        icon={<MapPin className="w-4 h-4" />}
        title="Location Required"
        handleClick={getLocation}
        description="Please enable location access to see your local weather."
      >
        {" "}
        <MapPin className="w-4 h-4 mr-2" />
        Enable Location
      </AlertComponent>
    );
  }

  if (locationError) {
    return (
      <AlertComponent
        icon={<AlertTriangle className="w-4 h-4" />}
        title="Location Error"
        handleClick={getLocation}
        description={locationError}
      >
        {" "}
        <MapPin className="w-4 h-4 mr-2" />
        Enable Location
      </AlertComponent>
    );
  }

  if (!weatherQuery.data || !forecastQuery.data || locationLoading) {
    return <WeatherSkeleton />;
  }

  const locationName = locationQuery.data?.[0];

  if (weatherQuery.error || forecastQuery.error) {
    return (
      <AlertComponent
        handleClick={handleRefresh}
        description="Failed to fetch weather data. Please try again."
        title="Error"
        icon={<AlertTriangle className="w-4 h-4" />}
      >
        <RefreshCw className="w-4 h-4 mr-2" />
        Retry
      </AlertComponent>
    );
  }

  return (
    <div className="space-y-4">
      {/* Favorite Cities */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold tracking-tight">My Location</h1>
        <Button
          variant={"outline"}
          size={"icon"}
          onClick={handleRefresh}
          disabled={weatherQuery.isFetching || forecastQuery.isFetching}
        >
          <RefreshCw
            className={`h-4 w-4 ${
              weatherQuery.isFetching ? "animate-spin" : ""
            }`}
          />
        </Button>
      </div>

      <div className="grid gap-6">
        <div className="flex flex-col gap-4 lg:flex-row">
          {/* current weather */}
          <CurrentWeather
            data={weatherQuery.data}
            locationName={locationName}
          />
          {/* hourly temperature */}
          <HourlyTemperature data={forecastQuery.data} />
        </div>
        <div className="grid items-start gap-6 md:grid-cols-2">
          {/* details */}
          <WeatherDetails data={weatherQuery.data} />
          {/* forecast */}
          <WeatherForecast data={forecastQuery.data} />
        </div>
      </div>
    </div>
  );
}

function AlertComponent({
  handleClick,
  title,
  icon,
  description,
  children,
}: AlertComponentProps) {
  return (
    <Alert variant="destructive">
      {icon}
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription className="flex flex-col gap-4">
        <p>{description}</p>
        <Button variant="outline" onClick={handleClick} className="w-fit">
          {children}
        </Button>
      </AlertDescription>
    </Alert>
  );
}

export default WeatherDashboard;
