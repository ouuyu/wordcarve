import ky from 'ky'

export const http = ky.create({
  timeout: 10000,
  retry: {
    limit: 2,
    methods: ['get', 'post', 'put', 'delete', 'patch'],
    statusCodes: [408, 413, 429, 500, 502, 503, 504],
  },
})

export { ky }
