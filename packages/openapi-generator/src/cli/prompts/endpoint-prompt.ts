import { checkbox } from '@inquirer/prompts';
import type { EndpointInfo } from '../../parser/endpoint-extractor.js';
import { formatEndpointLabel } from '../../parser/endpoint-extractor.js';

export async function promptEndpointSelection(endpoints: EndpointInfo[]): Promise<EndpointInfo[]> {
  const choices = endpoints.map((ep) => ({
    name: formatEndpointLabel(ep),
    value: ep,
    checked: ep.method === 'POST' || ep.method === 'PUT' || ep.method === 'PATCH',
  }));

  const selected = await checkbox({
    message: 'Select endpoints to generate forms for:',
    choices,
    required: true,
  });

  return selected;
}
