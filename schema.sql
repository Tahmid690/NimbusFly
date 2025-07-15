-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.aircraft (
  aircraft_id integer GENERATED ALWAYS AS IDENTITY NOT NULL,
  model character varying NOT NULL,
  total_seats integer NOT NULL,
  econ_seats integer NOT NULL,
  busi_seats integer NOT NULL,
  airline_id integer NOT NULL,
  registration_number character varying,
  manufacturer character varying,
  year_manufactured integer,
  max_range_km integer,
  status character varying,
  CONSTRAINT aircraft_pkey PRIMARY KEY (aircraft_id),
  CONSTRAINT aircraft_airline_id_fkey FOREIGN KEY (airline_id) REFERENCES public.airlines(airline_id)
);
CREATE TABLE public.airline_admin (
  admin_id integer GENERATED ALWAYS AS IDENTITY NOT NULL,
  email character varying NOT NULL UNIQUE,
  password character varying NOT NULL,
  airline_name character varying NOT NULL UNIQUE,
  airline_id integer,
  CONSTRAINT airline_admin_pkey PRIMARY KEY (admin_id),
  CONSTRAINT fk_airline FOREIGN KEY (airline_id) REFERENCES public.airlines(airline_id)
);
CREATE TABLE public.airlines (
  airline_id integer NOT NULL DEFAULT nextval('airlines_airline_id_seq'::regclass),
  airline_name character varying NOT NULL,
  logo_url character varying,
  CONSTRAINT airlines_pkey PRIMARY KEY (airline_id)
);
CREATE TABLE public.airports (
  airport_id integer GENERATED ALWAYS AS IDENTITY NOT NULL,
  airport_name character varying NOT NULL,
  iata_code character NOT NULL,
  city character varying NOT NULL,
  country character varying NOT NULL,
  CONSTRAINT airports_pkey PRIMARY KEY (airport_id)
);
CREATE TABLE public.bookings (
  booking_id integer GENERATED ALWAYS AS IDENTITY NOT NULL,
  customer_id integer NOT NULL,
  booking_date timestamp without time zone NOT NULL,
  total_amount numeric NOT NULL,
  payment_status character varying NOT NULL,
  trip_type character varying NOT NULL CHECK (trip_type::text = ANY (ARRAY['ONE-WAY'::character varying::text, 'ROUND-WAY'::character varying::text, 'MULTI-CITY'::character varying::text])),
  CONSTRAINT bookings_pkey PRIMARY KEY (booking_id),
  CONSTRAINT bookings_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES public.customer(customer_id)
);
CREATE TABLE public.customer (
  customer_id integer GENERATED ALWAYS AS IDENTITY NOT NULL,
  first_name character varying NOT NULL,
  last_name character varying NOT NULL,
  email character varying NOT NULL UNIQUE,
  password text NOT NULL,
  phone_number character varying NOT NULL UNIQUE,
  date_of_birth date,
  address character varying NOT NULL,
  CONSTRAINT customer_pkey PRIMARY KEY (customer_id)
);
CREATE TABLE public.flights (
  flight_id integer GENERATED ALWAYS AS IDENTITY NOT NULL,
  flight_number character varying NOT NULL,
  aircraft_id integer NOT NULL,
  origin_airport_id integer NOT NULL,
  destination_airport_id integer NOT NULL,
  departure_time timestamp without time zone NOT NULL,
  arrival_time timestamp without time zone NOT NULL,
  business_ticket_price numeric NOT NULL,
  economy_ticket_price numeric NOT NULL,
  round_trip_discount numeric,
  available_seats integer NOT NULL,
  available_busi_seats integer NOT NULL,
  available_econ_seats integer NOT NULL,
  baggage_limit integer,
  status boolean DEFAULT true,
  CONSTRAINT flights_pkey PRIMARY KEY (flight_id),
  CONSTRAINT flights_aircraft_id_fkey FOREIGN KEY (aircraft_id) REFERENCES public.aircraft(aircraft_id),
  CONSTRAINT flights_destination_airport_id_fkey FOREIGN KEY (destination_airport_id) REFERENCES public.airports(airport_id),
  CONSTRAINT flights_origin_airport_id_fkey FOREIGN KEY (origin_airport_id) REFERENCES public.airports(airport_id)
);
CREATE TABLE public.passengers (
  passenger_id integer GENERATED ALWAYS AS IDENTITY NOT NULL,
  customer_id integer NOT NULL,
  first_name character varying NOT NULL,
  last_name character varying NOT NULL,
  date_of_birth date,
  passport_number character varying NOT NULL,
  nationality character varying NOT NULL,
  title text,
  CONSTRAINT passengers_pkey PRIMARY KEY (passenger_id),
  CONSTRAINT passengers_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES public.customer(customer_id)
);
CREATE TABLE public.payments (
  payment_id integer GENERATED ALWAYS AS IDENTITY NOT NULL,
  booking_id integer NOT NULL,
  payment_method character varying NOT NULL,
  transaction_id character varying NOT NULL UNIQUE,
  payment_date date NOT NULL,
  status character varying NOT NULL CHECK (status::text = ANY (ARRAY['PAID'::character varying::text, 'UNPAID'::character varying::text])),
  CONSTRAINT payments_pkey PRIMARY KEY (payment_id),
  CONSTRAINT payments_booking_id_fkey FOREIGN KEY (booking_id) REFERENCES public.bookings(booking_id)
);
CREATE TABLE public.seats (
  seat_id integer GENERATED ALWAYS AS IDENTITY NOT NULL,
  aircraft_id integer NOT NULL,
  seat_number character varying NOT NULL,
  seat_class character varying NOT NULL CHECK (seat_class::text = ANY (ARRAY['Economy'::character varying, 'Business'::character varying]::text[])),
  is_booked boolean NOT NULL,
  CONSTRAINT seats_pkey PRIMARY KEY (seat_id),
  CONSTRAINT seats_aircraft_id_fkey FOREIGN KEY (aircraft_id) REFERENCES public.aircraft(aircraft_id)
);
CREATE TABLE public.ticket (
  ticket_id integer GENERATED ALWAYS AS IDENTITY NOT NULL,
  booking_id integer NOT NULL,
  flight_id integer NOT NULL,
  passenger_id integer NOT NULL,
  seat_id integer NOT NULL,
  CONSTRAINT ticket_pkey PRIMARY KEY (ticket_id),
  CONSTRAINT ticket_passenger_id_fkey FOREIGN KEY (passenger_id) REFERENCES public.passengers(passenger_id),
  CONSTRAINT ticket_seat_id_fkey FOREIGN KEY (seat_id) REFERENCES public.seats(seat_id),
  CONSTRAINT ticket_booking_id_fkey FOREIGN KEY (booking_id) REFERENCES public.bookings(booking_id),
  CONSTRAINT ticket_flight_id_fkey FOREIGN KEY (flight_id) REFERENCES public.flights(flight_id)
);
