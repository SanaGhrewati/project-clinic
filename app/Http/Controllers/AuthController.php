<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;


class AuthController extends Controller
{


    public function login(Request $request)
    {


        $request->validate([

            'email'=>'required|email',
            'password'=>'required'

        ]);



        $user = User::where('email',$request->email)->first();



        if(!$user || !Hash::check($request->password,$user->password))
        {

            return response()->json([

                'message'=>'البريد أو كلمة المرور غير صحيحة'

            ],401);

        }



        if(!$user->approved)
        {

            return response()->json([

                'message'=>'الحساب غير مفعل'

            ],403);

        }




        // السماح فقط admin و doctor
        if(!in_array($user->role,['admin','doctor']))
        {

            return response()->json([

                'message'=>'غير مصرح بالدخول'

            ],403);

        }



        $token = $user->createToken('clinic-token')->plainTextToken;



        return response()->json([


            'token'=>$token,


            'user'=>[

                'id'=>$user->id,

                'name'=>$user->name,

                'email'=>$user->email,

                'role'=>$user->role,


                // إذا كان طبيب يوجد doctor_type
                'doctor_type'=> $user->doctor 
                    ? $user->doctor->doctor_type 
                    : null


            ]


        ]);

    }




    public function logout(Request $request)
    {


        $request->user()->currentAccessToken()->delete();



        return response()->json([

            'message'=>'تم تسجيل الخروج'

        ]);

    }



}