////////////////////////////////////////////////////////////////////////////////
/// @brief default rights
///
/// @file
///
/// DISCLAIMER
///
/// Copyright 2010-2011 triagens GmbH, Cologne, Germany
///
/// Licensed under the Apache License, Version 2.0 (the "License");
/// you may not use this file except in compliance with the License.
/// You may obtain a copy of the License at
///
///     http://www.apache.org/licenses/LICENSE-2.0
///
/// Unless required by applicable law or agreed to in writing, software
/// distributed under the License is distributed on an "AS IS" BASIS,
/// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
/// See the License for the specific language governing permissions and
/// limitations under the License.
///
/// Copyright holder is triAGENS GmbH, Cologne, Germany
///
/// @author Dr. Frank Celler
/// @author Copyright 2011, triagens GmbH, Cologne, Germany
////////////////////////////////////////////////////////////////////////////////

#ifndef TRIAGENS_ADMIN_RIGHT_H
#define TRIAGENS_ADMIN_RIGHT_H 1

#include <Basics/Common.h>

#include <Basics/Logger.h>

namespace triagens {
  namespace admin {

    ////////////////////////////////////////////////////////////////////////////////
    /// @brief a single right
    ////////////////////////////////////////////////////////////////////////////////

    typedef uint32_t right_t;

    ////////////////////////////////////////////////////////////////////////////////
    /// @brief right to manage an administrator account
    ///
    /// Right to create, delete, or change role.
    ////////////////////////////////////////////////////////////////////////////////

    right_t const RIGHT_TO_MANAGE_ADMIN = 1000;

    ////////////////////////////////////////////////////////////////////////////////
    /// @brief right to manage an user account
    ///
    /// Right to create, delete, or change role.
    ////////////////////////////////////////////////////////////////////////////////

    right_t const RIGHT_TO_MANAGE_USER = 1001;

    ////////////////////////////////////////////////////////////////////////////////
    /// @brief right to be deleted
    ////////////////////////////////////////////////////////////////////////////////

    right_t const RIGHT_TO_BE_DELETED = 1002;

    ////////////////////////////////////////////////////////////////////////////////
    /// @brief right to login in
    ////////////////////////////////////////////////////////////////////////////////

    right_t const RIGHT_TO_LOGIN = 1003;
  }
}

#endif


