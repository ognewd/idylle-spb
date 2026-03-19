/**
 * Типы для работы с API СДЕК
 */

export interface CdekAuthResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  scope?: string;
}

export interface CdekLocation {
  code?: number;
  city?: string;
  address?: string;
  postal_code?: string;
}

export interface CdekTariff {
  tariff_code: number;
  tariff_name: string;
  tariff_description?: string;
  delivery_mode?: number;
  delivery_sum: number;
  period_min: number;
  period_max: number;
  calendar_min?: number;
  calendar_max?: number;
}

export interface CdekCalculateRequest {
  from_location: CdekLocation;
  to_location: CdekLocation;
  packages: Array<{
    weight: number; // в граммах
    length?: number; // в см
    width?: number; // в см
    height?: number; // в см
  }>;
  tariff_code?: number;
  services?: Array<{
    code: string;
    parameter?: string;
  }>;
}

export interface CdekCalculateResponse {
  tariffs?: CdekTariff[]; // для обратной совместимости
  tariff_codes?: CdekTariff[]; // реальный формат ответа API СДЕК
}

export interface CdekPvz {
  code: string;
  name: string;
  location: {
    code: number;
    city: string;
    city_code?: number;
    address: string;
    postal_code?: string;
    longitude?: number;
    latitude?: number;
  };
  work_time?: string;
  phones?: Array<{
    number: string;
  }>;
  email?: string;
  note?: string;
  type?: string;
  owner_code?: string;
  is_handout?: boolean;
  is_reception?: boolean;
  is_dressing_room?: boolean;
  have_cashless?: boolean;
  have_cash?: boolean;
  allowed_cod?: boolean;
  nearest_station?: string;
  metro_station?: string;
}

export interface CdekPvzRequest {
  type?: 'PVZ' | 'POSTAMAT' | 'ALL';
  city_code?: number;
  city?: string;
  region_code?: number;
  country_code?: string;
  postal_code?: string;
  fias_region_guid?: string;
  fias_city_guid?: string;
  code?: string;
  lang?: 'rus' | 'eng' | 'zho';
}

export interface CdekCreateOrderRequest {
  number?: string; // Номер заказа в вашей системе
  tariff_code: number;
  shipment_point?: string; // Код ПВЗ отправки (например SPB169)
  from_location: CdekLocation;
  to_location: CdekLocation;
  sender: {
    name: string;
    company?: string;
    email?: string;
    phones: Array<{
      number: string;
    }>;
  };
  recipient: {
    name: string;
    company?: string;
    email?: string;
    phones: Array<{
      number: string;
    }>;
  };
  packages: Array<{
    number?: string;
    weight: number;
    length?: number;
    width?: number;
    height?: number;
    items?: Array<{
      name: string;
      ware_key?: string;
      payment?: {
        value: number;
        vat_sum?: number;
      };
      cost: number;
      amount: number;
      weight: number;
      url?: string;
    }>;
  }>;
  services?: Array<{
    code: string;
    parameter?: string;
  }>;
  comment?: string;
}

export interface CdekOrderResponse {
  request_uuid?: string;
  type: string;
  cdek_number?: string;
  number?: string;
  tariff_code?: number;
  statuses?: Array<{
    code: string;
    name: string;
    datetime: string;
    reason_code?: string;
  }>;
  warnings?: Array<{
    code: string;
    message: string;
  }>;
  errors?: Array<{
    code: string;
    message: string;
  }>;
  entity?: {
    uuid?: string;
    cdek_number?: string;
  };
}

export interface CdekError {
  error: string;
  error_description?: string;
  error_uri?: string;
  request_uuid?: string;
}
