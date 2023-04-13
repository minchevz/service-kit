// This function was added to try and ensure the timestamp for a log appears at the start of the entry
// This is because our splunk forwarder is set to check for timestamps within the first 128 characters of an entry
// All our keys in splunk seem to end up in alphabetical order, so this should mean we end up with a timestamp key at the start also

export default {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  transform(info: any) {
    info['_timestamp'] = info.timestamp;

    return info;
  }
};
