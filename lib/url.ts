import { $$PropertyValue } from '@stitches/react'
import { NextRouter } from 'next/router'

function toggleOnAttribute(
  router: NextRouter,
  attribute: string,
  value: string
) {
  const query = router.query
  
  const attrValue = query[`attributes[${attribute}]`]
  
  if (!!attrValue) {
    query[`attributes[${attribute}]`] = [value].concat(attrValue)
  } else {
    query[`attributes[${attribute}]`] = value
  }
  
  router.push(
    {
      query
    },
    undefined,
    {
      shallow: true,
      scroll: false,
    }
  )
}

function toggleOffAttribute(router: NextRouter, attribute: string) {
  let query = router.query

  delete query[`attributes[${attribute}]`]

  router.push(
    {
      query,
    },
    undefined,
    {
      shallow: true,
      scroll: false,
    }
  )
}
function toggleOffAttributeValue(router: NextRouter, attribute: string, value: string) {

  const attrValue = router.query[`attributes[${attribute}]`]
  const query = router.query

  if (!Array.isArray(attrValue)) {
    delete query[`attributes[${attribute}]`]
  } else {
    query[`attributes[${attribute}]`] = attrValue.filter(it => it !== value)
  }
  
  router.push(
    {
      query,
    },
    undefined,
    {
      shallow: true,
      scroll: false,
    }
  )
}

function updateAttribute(router: NextRouter, attribute: string, value: string) {
  let attr : string | string[] |undefined = router.query[`attributes[${attribute}]`]
  if (attr === undefined) {
    attr = value
  } else if (Array.isArray(attr)){
    attr.push(value)
  } else {
    attr = [attr, value]
  }
  router.push(
    {
      query: { 
        ...router.query,
        [`attributes[${attribute}]`]: attr
      },
    },
    undefined,
    {
      shallow: true,
      scroll: false,
    }
  )
}

function toggleOnUrlParam(
  router: NextRouter,
  key: string,
  value: string
) {
  router.push(
    {
      query: { ...router.query, [key]: value },
    },
    undefined,
    {
      shallow: true,
      scroll: false,
    }
  )
}

function toggleOffUrlParam(router: NextRouter, key: string) {
  let query = router.query

  delete query[key]

  router.push(
    {
      query,
    },
    undefined,
    {
      shallow: true,
      scroll: false,
    }
  )
}

function updateUrlParam(router: NextRouter, key: string, value: string) {
  router.push(
    {
      query: { ...router.query, [key]: value },
    },
    undefined,
    {
      shallow: true,
      scroll: false,
    }
  )
}

export { toggleOffAttribute, toggleOnAttribute, updateAttribute, toggleOffAttributeValue, toggleOnUrlParam, toggleOffUrlParam, updateUrlParam }
